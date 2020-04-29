import { defineMutations } from 'direct-vuex'
import {
  S,
  UserRTCState,
  SessionInfo,
  SessionId,
  ExtendedMediaStream
} from './state'
import { WebRTCUserState } from '@traptitech/traq'
import Vue from 'vue'
import { ChannelId, UserId } from '@/types/entity-ids'
import AudioStreamMixer from '@/lib/audioStreamMixer'

const toSessionInfo = (
  sessionId: SessionId,
  channelId: ChannelId
): SessionInfo => {
  const [sessionType, id] = sessionId.split('-')
  if (
    id &&
    (sessionType === ('qall' as const) || sessionType === ('draw' as const))
  ) {
    return {
      sessionId,
      channelId,
      type: sessionType
    }
  }
  throw 'invalid session id'
}

const toUserRTCState = (userState: WebRTCUserState): UserRTCState => ({
  channelId: userState.channelId,
  sessionStates: userState.sessions.map(session => ({
    sessionId: session.sessionId,
    states: session.state.split('.')
  }))
})

/** 現在のチャンネルセッションと、新規に追加するユーザー状態が整合性をもつか */
const isSessionCompatible = (
  channelSessionsMap: Record<ChannelId, SessionId[] | undefined>,
  userSessionState: UserRTCState
) => {
  // チャンネルにセッションが立っていないか、既存セッションの部分集合か
  const currentSessions = channelSessionsMap[userSessionState.channelId]
  if (!currentSessions) return true

  const sessionInfoSet = new Set<SessionId>([
    ...currentSessions,
    ...userSessionState.sessionStates.map(s => s.sessionId)
  ])
  return sessionInfoSet.size <= currentSessions.length
}

export const mutations = defineMutations<S>()({
  setRTCState(state, payload: WebRTCUserState[]) {
    const userStateMap: typeof state.userStateMap = {}
    const channelSessionsMap: typeof state.channelSessionsMap = {}
    const sessionInfoMap: typeof state.sessionInfoMap = {}
    const sessionUsersMap: typeof state.sessionUsersMap = {}
    payload.forEach(rtcState => {
      const userSessionState = toUserRTCState(rtcState)
      if (!isSessionCompatible(channelSessionsMap, userSessionState)) {
        throw 'channel session conflict'
      }

      userStateMap[rtcState.userId] = userSessionState
      channelSessionsMap[
        rtcState.channelId
      ] = userSessionState.sessionStates.map(s => s.sessionId)
      userSessionState.sessionStates.forEach(s => {
        if (sessionInfoMap[s.sessionId]) {
          sessionUsersMap[s.sessionId]?.push(rtcState.userId)
        } else {
          const newSessionInfo = toSessionInfo(s.sessionId, rtcState.channelId)
          sessionInfoMap[s.sessionId] = newSessionInfo
          sessionUsersMap[s.sessionId] = [rtcState.userId]
        }
      })
    })
    state.userStateMap = userStateMap
    state.channelSessionsMap = channelSessionsMap
    state.sessionInfoMap = sessionInfoMap
    state.sessionUsersMap = sessionUsersMap
  },
  updateRTCState(state, payload: WebRTCUserState) {
    const userSessionState = toUserRTCState(payload)
    if (!isSessionCompatible(state.channelSessionsMap, userSessionState)) {
      throw 'channel session conflict'
    }

    const currentSessionIds =
      state.userStateMap[payload.userId]?.sessionStates?.map(
        s => s.sessionId
      ) ?? []
    const newSessionIds = userSessionState.sessionStates.map(s => s.sessionId)
    const removedSessionIds = currentSessionIds.filter(
      id => !newSessionIds.includes(id)
    )
    const addedSessionIds = newSessionIds.filter(
      id => !currentSessionIds.includes(id)
    )
    if (userSessionState.sessionStates.length === 0) {
      Vue.delete(state.userStateMap, payload.userId)
    } else {
      Vue.set(state.userStateMap, payload.userId, userSessionState)
    }

    addedSessionIds.forEach(sessionId => {
      if (state.sessionInfoMap[sessionId]) {
        state.sessionUsersMap[sessionId]?.push(payload.userId)
      } else {
        const newSessionInfo = toSessionInfo(sessionId, payload.channelId)
        const newChannelSessions = [
          ...(state.channelSessionsMap[payload.channelId] ?? []),
          sessionId
        ]
        Vue.set(state.channelSessionsMap, payload.channelId, newChannelSessions)
        Vue.set(state.sessionInfoMap, sessionId, newSessionInfo)
        Vue.set(state.sessionUsersMap, sessionId, [payload.userId])
      }
    })

    removedSessionIds.forEach(sessionId => {
      const index =
        state.sessionUsersMap[sessionId]?.findIndex(
          userId => userId === payload.userId
        ) ?? -1
      if (index < 0) {
        throw 'something went wrong'
      }
      state.sessionUsersMap[sessionId]?.splice(index, 1)
      // セッションの最後の一人が消えた
      const isLastUserforSession =
        (state.sessionUsersMap[sessionId]?.length ?? 0) === 0
      if (isLastUserforSession) {
        const channelId = state.sessionInfoMap[sessionId]?.channelId ?? ''
        const sessionIds = state.channelSessionsMap[channelId]
        if (!sessionIds) return
        const newSessionIds = [...sessionIds]
        const index = newSessionIds.findIndex(sid => sid === sessionId)
        newSessionIds.splice(index, 1)
        Vue.delete(state.sessionInfoMap, sessionId)
        if (newSessionIds.length === 0) {
          Vue.delete(state.channelSessionsMap, channelId)
        } else {
          Vue.set(state.channelSessionsMap, channelId, newSessionIds)
        }
      }
    })
  },
  setCurrentRTCState(state, payload: UserRTCState) {
    state.currentRTCState = payload
  },
  unsetCurrentRTCState(state) {
    state.currentRTCState = undefined
  },
  setMixer(state, mixer: AudioStreamMixer) {
    state.mixer = mixer
  },
  unsetMixer(state) {
    state.mixer = undefined
  },
  setLocalStream(state, mediaStream: ExtendedMediaStream) {
    state.localStream = mediaStream
  },
  unsetLocalStream(state) {
    if (state.localStream) {
      state.localStream.getTracks().forEach(t => t.stop())
    }
    state.localStream = undefined
  },
  muteLocalStream(state) {
    if (!state.localStream) return
    state.localStream.userMuted = true
    state.localStream.getAudioTracks().forEach(track => {
      track.enabled = false
    })
    state.isMicMuted = true
  },
  unmuteLocalStream(state) {
    if (!state.localStream) return
    state.localStream.userMuted = true
    state.localStream.getAudioTracks().forEach(track => {
      track.enabled = true
    })
    state.isMicMuted = false
  },
  addRemoteStream(
    state,
    payload: { userId: UserId; mediaStream: MediaStream }
  ) {
    Vue.set(state.remoteAudioStreamMap, payload.userId, payload.mediaStream)
  },
  removeRemoteStream(state, userId: UserId) {
    state.remoteAudioStreamMap[userId]?.getTracks().forEach(t => t.stop())
    Vue.delete(state.remoteAudioStreamMap, userId)
  },
  clearRemoteStream(state) {
    Object.values(state.remoteAudioStreamMap).forEach(stream =>
      stream?.getTracks().forEach(t => t.stop())
    )
    state.remoteAudioStreamMap = {}
  },
  /**
   * @param volume 0-1で指定するボリューム (0がミュート、1がAudioStreamMixer.maxGainに相当するゲイン)
   */
  setUserVolume(state, { userId, volume }: { userId: string; volume: number }) {
    Vue.set(state.userVolumeMap, userId, volume)
    if (state.mixer) {
      state.mixer.setVolumeOf(userId, volume)
    }
  }
})
