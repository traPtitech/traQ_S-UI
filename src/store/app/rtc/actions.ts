import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '@/store'
import { rtc } from './index'
import apis from '@/lib/apis'
import { ChannelId } from '@/types/entity-ids'
import { randomString } from '@/lib/util/randomString'
import { client, initClient, destroyClient } from '@/lib/webrtc/traQRTCClient'
import AudioStreamMixer from '@/lib/audioStreamMixer'
import { getUserAudio, getUserDisplay } from '@/lib/webrtc/userMedia'
import { UserSessionState, SessionId, SessionType } from './state'
import { changeRTCState } from '@/lib/websocket'
import { WebRTCUserStateSessions } from '@traptitech/traq'
import { ActionContext } from 'vuex'

const defaultState = 'joined'

export const rtcActionContext = (context: ActionContext<unknown, unknown>) =>
  moduleActionContext(context, rtc)

export const actions = defineActions({
  // ---- RTC Session ---- //
  async fetchRTCState(context) {
    const { commit } = rtcActionContext(context)
    const { data } = await apis.getWebRTCState()
    if (data) {
      commit.setRTCState(data.flat(1))
    }
  },

  async syncRTCState(context) {
    const { state } = rtcActionContext(context)
    if (!state.currentRTCState) {
      changeRTCState(null, [])
      return
    }
    const sessionStates = state.currentRTCState.sessionStates
    const userStateSessions: WebRTCUserStateSessions[] = sessionStates.map(
      s => ({
        state: s.states.join('.'),
        sessionId: s.sessionId
      })
    )
    changeRTCState(state.currentRTCState.channelId, userStateSessions)
  },

  async addRTCSession(context, payload: UserSessionState) {
    const { state, commit, dispatch } = rtcActionContext(context)
    const currentState = state.currentRTCState
    if (!currentState) return
    commit.setCurrentRTCState({
      channelId: currentState.channelId,
      sessionStates: [...currentState.sessionStates, payload]
    })
    await dispatch.syncRTCState()
  },
  async removeRTCSession(context, payload: { sessionId: SessionId }) {
    const { state, commit, dispatch } = rtcActionContext(context)
    const currentState = state.currentRTCState
    if (!currentState) return
    const sessionStates = [...currentState.sessionStates]
    const index = sessionStates.findIndex(
      s => s.sessionId === payload.sessionId
    )
    sessionStates.splice(index, 1)
    if (sessionStates.length === 0) {
      commit.unsetCurrentRTCState()
    } else {
      commit.setCurrentRTCState({
        channelId: currentState.channelId,
        sessionStates: sessionStates
      })
    }
    await dispatch.syncRTCState()
  },
  async modifyRTCSession(
    context,
    payload: { sessionId: SessionId; states: string[] }
  ) {
    const { state, commit, dispatch } = rtcActionContext(context)
    const currentState = state.currentRTCState
    const index = currentState?.sessionStates.findIndex(
      s => s.sessionId === payload.sessionId
    )
    if (!currentState || index === undefined || index < 0) return
    const newSessionStates = [...currentState.sessionStates]
    newSessionStates.splice(index, 1, payload)
    commit.setCurrentRTCState({
      channelId: currentState.channelId,
      sessionStates: newSessionStates
    })
    await dispatch.syncRTCState()
  },

  startOrJoinRTCSession(
    context,
    payload: { channelId: ChannelId; sessionType: SessionType }
  ): { sessionId: string; isNewSession: boolean } {
    const { state, commit, dispatch } = rtcActionContext(context)
    if (
      state.currentRTCState &&
      state.currentRTCState.channelId !== payload.channelId
    ) {
      throw `RTC session is already open for channel ${payload.channelId}`
    }
    if (!state.currentRTCState) {
      commit.setCurrentRTCState({
        channelId: payload.channelId,
        sessionStates: []
      })
    }
    const currentSession = state.channelSessionsMap[payload.channelId]
      ?.map(sessionId => state.sessionInfoMap[sessionId])
      .find(session => session?.type === payload.sessionType)
    const sessionId =
      currentSession?.sessionId ?? payload.sessionType + '-' + randomString()
    dispatch.addRTCSession({
      sessionId,
      states: [defaultState]
    })
    return { sessionId, isNewSession: !currentSession }
  },

  // ---- RTC Connection ---- //

  initializeMixer(context) {
    const { state, commit } = rtcActionContext(context)
    const mixer = new AudioStreamMixer()

    Object.keys(state.remoteAudioStreamMap).forEach(userId => {
      const stream = state.remoteAudioStreamMap[userId]
      if (stream) {
        mixer.addStream(userId, stream)
      }
    })

    mixer.addFileSource('qall_start', '/static/qall_start.mp3')
    mixer.addFileSource('qall_end', '/static/qall_end.mp3')
    mixer.addFileSource('qall_joined', '/static/qall_joined.mp3')
    mixer.addFileSource('qall_left', '/static/qall_left.mp3')

    commit.setMixer(mixer)
  },

  async establishConnection(context) {
    const { rootState, dispatch } = rtcActionContext(context)
    if (!rootState.domain.me.detail) {
      throw 'application not initialized'
    }
    if (client) {
      client.closeConnection()
    }
    const id = rootState.domain.me.detail.id
    initClient(id)
    client?.addEventListener('connectionerror', e => {
      /* eslint-disable-next-line no-console */
      console.error(`[RTC] Failed to establish connection`)
      if (e.detail.err.type === 'unavailable-id') {
        /* eslint-disable-next-line no-console */
        console.error(`[RTC] Peer Id already in use!`)
      }
      window.alert('接続に失敗しました')
      dispatch.closeConnection()
    })
    await client?.establishConnection()
  },

  leaveRoom(context, roomName: string) {
    const { dispatch } = rtcActionContext(context)
    if (!client) {
      return
    }
    client.leaveRoom(roomName)
    if (client.roomsCount === 0) {
      dispatch.closeConnection()
    }
  },

  closeConnection(context) {
    const { commit } = rtcActionContext(context)
    if (!client) {
      return
    }
    client.closeConnection()
    destroyClient()
    commit.unsetLocalStream()
    commit.unsetLocalVideoStream()
    commit.clearRemoteStream()
  },

  async joinVoiceChannel(context, room: string) {
    const { state, commit, rootState, dispatch } = rtcActionContext(context)
    if (!rootState.app.rtcSettings.isEnabled) {
      return
    }
    while (!client) {
      await dispatch.establishConnection()
    }

    dispatch.initializeMixer()
    if (!state.mixer) {
      return
    }

    client.addEventListener('userjoin', e => {
      const userId = e.detail.userId
      /* eslint-disable-next-line no-console */
      console.log(`[RTC] User joined, ID: ${userId}`)
      if (state.mixer) {
        state.mixer.playFileSource('qall_joined')
      }
    })

    client.addEventListener('userleave', async e => {
      const userId = e.detail.userId
      /* eslint-disable-next-line no-console */
      console.log(`[RTC] User left, ID: ${userId}`)
      commit.removeRemoteStream(userId)

      if (state.mixer) {
        await state.mixer.removeStream(userId)
        state.mixer.playFileSource('qall_left')
      }
    })

    client.addEventListener('streamchange', async e => {
      const stream = e.detail.stream
      const userId = stream.peerId
      /* eslint-disable-next-line no-console */
      console.log(`[RTC] Recieved stream from ${stream.peerId}`)
      commit.addRemoteStream({ userId, mediaStream: stream })

      if (state.mixer) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await state.mixer.addStream(stream.peerId, stream)
      }
      commit.setUserVolume({ userId, volume: 0.5 })
    })

    const localStream = await getUserAudio(
      rootState.app.rtcSettings.audioInputDeviceId
    )
    commit.setLocalStream(localStream)

    if (state.isMicMuted) {
      dispatch.mute()
    } else {
      dispatch.unmute()
    }

    await client.joinRoom(room, localStream)

    state.mixer.playFileSource('qall_start')
  },
  async joinVideoChannel(
    context,
    payload: { roomName: string; withStream: boolean }
  ) {
    const { commit, rootState, dispatch } = rtcActionContext(context)

    if (!rootState.app.rtcSettings.isEnabled) {
      return
    }
    while (!client) {
      await dispatch.establishConnection()
    }
    if (payload.withStream) {
      const localStream = await getUserDisplay()
      localStream.getAudioTracks().forEach(track => (track.enabled = false))

      commit.setLocalVideoStream(localStream)
      await client.joinRoom(payload.roomName, localStream)
    } else {
      await client.joinRoom(payload.roomName)
    }
  },
  mute(context) {
    const { state, commit, getters, dispatch } = rtcActionContext(context)
    const qallSession = getters.qallSession
    if (!state.localStream || !qallSession) {
      return
    }
    commit.muteLocalStream()
    const states = [...new Set([...(qallSession?.states ?? []), 'micmuted'])]
    dispatch.modifyRTCSession({
      sessionId: qallSession?.sessionId,
      states
    })
  },
  unmute(context) {
    const { state, commit, getters, dispatch } = rtcActionContext(context)
    const qallSession = getters.qallSession
    if (!state.localStream || !qallSession) {
      return
    }
    commit.unmuteLocalStream()
    const stateSet = new Set(qallSession?.states ?? [])
    stateSet.delete('micmuted')
    const states = [...stateSet]
    dispatch.modifyRTCSession({
      sessionId: qallSession?.sessionId,
      states
    })
  },

  // ---- Specific RTC Session ---- //
  async startQall(context, channelId: ChannelId) {
    const { dispatch } = rtcActionContext(context)
    try {
      const { sessionId } = await dispatch.startOrJoinRTCSession({
        channelId,
        sessionType: 'qall'
      })
      dispatch.joinVoiceChannel(sessionId)
    } catch (e) {
      // TODO: エラー
    }
  },

  async endQall(context) {
    const { state, commit, getters, dispatch } = rtcActionContext(context)
    const qallSession = getters.qallSession
    if (!qallSession) {
      throw 'something went wrong'
    }
    await dispatch.leaveRoom(qallSession.sessionId)
    if (state.mixer) {
      state.mixer.playFileSource('qall_end')
      state.mixer.muteAll()
    }
    commit.unsetMixer()
    dispatch.removeRTCSession({ sessionId: qallSession.sessionId })
  },

  async startVideoCasting(context, channelId: ChannelId) {
    const { state, dispatch } = rtcActionContext(context)
    const { sessionId } = await dispatch.startOrJoinRTCSession({
      channelId,
      sessionType: 'video'
    })
    const castingUser = Object.values(state.userStateMap).find(userState =>
      userState?.sessionStates.some(
        sessionState =>
          sessionState.sessionId === sessionId &&
          sessionState.states.includes('casting')
      )
    )
    if (castingUser) {
      throw 'cant cast simultaneously'
    }
    dispatch.joinVideoChannel({ roomName: sessionId, withStream: true })
  },
  async startVideoStreaming(context, channelId: ChannelId) {
    const { dispatch } = rtcActionContext(context)
    try {
      const { sessionId } = await dispatch.startOrJoinRTCSession({
        channelId,
        sessionType: 'video'
      })
      dispatch.joinVideoChannel({ roomName: sessionId, withStream: false })
    } catch (e) {
      // TODO: エラー
    }
  },
  async endVideoSession(context) {
    const { getters, dispatch } = rtcActionContext(context)
    const videoSession = getters.videoSession

    if (!videoSession) {
      throw 'something went wrong'
    }
    await dispatch.leaveRoom(videoSession.sessionId)
    dispatch.removeRTCSession({ sessionId: videoSession.sessionId })
  }
})
