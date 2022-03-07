import { ChannelId } from '/@/types/entity-ids'
import { WebRTCUserState } from '@traptitech/traq'
import { defineMutations } from 'direct-vuex'
import { S, SessionId, SessionInfo, UserRTCState } from './state'

const toUserRTCState = (
  userState: Readonly<WebRTCUserState>
): UserRTCState => ({
  channelId: userState.channelId,
  sessionStates: userState.sessions.map(session => ({
    sessionId: session.sessionId,
    states: session.state.split('.')
  }))
})

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

/**
 * 現在のチャンネルセッションと、新規に追加するユーザー状態が整合性をもつか
 */
const isSessionCompatible = (
  channelSessionsMap: ReadonlyMap<ChannelId, ReadonlySet<SessionId>>,
  userSessionState: Readonly<UserRTCState>
) => {
  // チャンネルにセッションが立っていないか、既存セッションの部分集合か
  const currentSessions = channelSessionsMap.get(userSessionState.channelId)
  if (!currentSessions) return true

  const sessionInfoSet = new Set<SessionId>([
    ...currentSessions,
    ...userSessionState.sessionStates.map(s => s.sessionId)
  ])
  return sessionInfoSet.size <= currentSessions.size
}

export const mutations = defineMutations<S>()({
  setRTCState(state, payload: readonly WebRTCUserState[]) {
    const userStateMap: typeof state.userStateMap = new Map()
    const channelSessionsMap: typeof state.channelSessionsMap = new Map()
    const sessionInfoMap: typeof state.sessionInfoMap = new Map()
    const sessionUsersMap: typeof state.sessionUsersMap = new Map()

    payload.forEach(rtcState => {
      const userSessionState = toUserRTCState(rtcState)
      if (!isSessionCompatible(channelSessionsMap, userSessionState)) {
        throw 'channel session conflict'
      }

      userStateMap.set(rtcState.userId, userSessionState)
      channelSessionsMap.set(
        rtcState.channelId,
        new Set(userSessionState.sessionStates.map(s => s.sessionId))
      )
      userSessionState.sessionStates.forEach(s => {
        if (sessionInfoMap.has(s.sessionId)) {
          sessionUsersMap.get(s.sessionId)?.add(rtcState.userId)
        } else {
          const newSessionInfo = toSessionInfo(s.sessionId, rtcState.channelId)
          sessionInfoMap.set(s.sessionId, newSessionInfo)
          sessionUsersMap.set(s.sessionId, new Set([rtcState.userId]))
        }
      })
    })

    state.userStateMap = userStateMap
    state.channelSessionsMap = channelSessionsMap
    state.sessionInfoMap = sessionInfoMap
    state.sessionUsersMap = sessionUsersMap
  },
  updateRTCState(state, payload: Readonly<WebRTCUserState>) {
    const userSessionState = toUserRTCState(payload)
    if (!isSessionCompatible(state.channelSessionsMap, userSessionState)) {
      throw 'channel session conflict'
    }

    const currentSessionIds =
      state.userStateMap
        .get(payload.userId)
        ?.sessionStates?.map(s => s.sessionId) ?? []
    const newSessionIds = userSessionState.sessionStates.map(s => s.sessionId)
    const removedSessionIds = currentSessionIds.filter(
      id => !newSessionIds.includes(id)
    )
    const addedSessionIds = newSessionIds.filter(
      id => !currentSessionIds.includes(id)
    )
    if (userSessionState.sessionStates.length === 0) {
      state.userStateMap.delete(payload.userId)
    } else {
      state.userStateMap.set(payload.userId, userSessionState)
    }

    addedSessionIds.forEach(sessionId => {
      if (state.sessionInfoMap.has(sessionId)) {
        state.sessionUsersMap.get(sessionId)?.add(payload.userId)
      } else {
        const newSessionInfo = toSessionInfo(sessionId, payload.channelId)
        const newChannelSessions =
          state.channelSessionsMap.get(payload.channelId) ?? new Set()
        newChannelSessions.add(sessionId)
        state.channelSessionsMap.set(payload.channelId, newChannelSessions)
        state.sessionInfoMap.set(sessionId, newSessionInfo)
        state.sessionUsersMap.set(sessionId, new Set([payload.userId]))
      }
    })

    removedSessionIds.forEach(sessionId => {
      const deleted = state.sessionUsersMap
        .get(sessionId)
        ?.delete(payload.userId)
      if (!deleted) {
        throw 'something went wrong'
      }
      // セッションの最後の一人が消えた
      const isLastUserforSession =
        (state.sessionUsersMap.get(sessionId)?.size ?? 0) === 0
      if (isLastUserforSession) {
        const channelId = state.sessionInfoMap.get(sessionId)?.channelId ?? ''
        const sessionIds = state.channelSessionsMap.get(channelId)
        if (!sessionIds) return
        sessionIds.delete(sessionId)
        state.sessionInfoMap.delete(sessionId)
        if (sessionIds.size === 0) {
          state.channelSessionsMap.delete(channelId)
        }
      }
    })
  }
})
