import { WebRTCUserState, WebRTCUserStateSessions } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'
import apis from '/@/lib/apis'
import { createSingleflight } from '/@/lib/basic/async'
import { formatSnakeKeysToCamelShallow } from '/@/lib/basic/record'
import { changeRTCState, wsListener } from '/@/lib/websocket'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { ChannelId, UserId } from '/@/types/entity-ids'
import { useMeStore } from '/@/store/domain/me'

export type SessionId = string
export type SessionType = 'qall' | 'draw'
export type SessionInfoBase = {
  sessionId: SessionId
  type: SessionType
  channelId: ChannelId
}
export type QallSessionInfo = SessionInfoBase & { type: 'qall' }
export type DrawSessionInfo = SessionInfoBase & { type: 'draw' }
export type SessionInfo = QallSessionInfo | DrawSessionInfo

export type UserSessionState = {
  sessionId: SessionId
  states: string[]
}
export type UserRTCState = {
  channelId: ChannelId
  sessionStates: UserSessionState[]
}

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

const getWebRTCState = createSingleflight(apis.getWebRTCState.bind(apis))

/**
 * サーバーに状態を送信する
 */
const postRTCState = (state: Readonly<UserRTCState> | null) => {
  if (!state) {
    changeRTCState(null, [])
    return
  }
  const userStateSessions: WebRTCUserStateSessions[] = state.sessionStates.map(
    s => ({
      state: s.states.join('.'),
      sessionId: s.sessionId
    })
  )
  changeRTCState(state.channelId, userStateSessions)
}

/**
 * traQサーバーでのRTC状態を扱うstore
 */
const useDomainRtcStorePinia = defineStore('domain/rtc', () => {
  const meStore = useMeStore()

  /** 一度でも取得が完了したかどうか */
  const rtcStateFetched = ref(false)
  /** ユーザーのRTC状態のマップ */
  const userStateMap = ref(new Map<UserId, UserRTCState>())
  /** チャンネルIDと立っているセッションIDのマップ */
  const channelSessionsMap = ref(new Map<ChannelId, Set<SessionId>>())
  /** セッションIDとセッションの状態のマップ */
  const sessionInfoMap = ref(new Map<SessionId, SessionInfo>())
  /** セッションIDとセッションの状態のマップ */
  const sessionUsersMap = ref(new Map<SessionId, Set<UserId>>())

  const getChannelRTCSessionId = (
    sessionType: SessionType,
    channelId: ChannelId
  ) => {
    const sessionIds = channelSessionsMap.value.get(channelId)
    if (!sessionIds) return
    return [...sessionIds].find(
      sessionId => sessionInfoMap.value.get(sessionId)?.type === sessionType
    )
  }
  const currentRTCState = computed(() =>
    userStateMap.value.get(meStore.myId.value ?? '')
  )
  const qallSession = computed(() =>
    currentRTCState.value?.sessionStates.find(
      s => sessionInfoMap.value.get(s.sessionId)?.type === 'qall'
    )
  )
  const currentSessionUsers = computed((): Set<UserId> => {
    if (!qallSession.value) return new Set()
    return sessionUsersMap.value.get(qallSession.value.sessionId) ?? new Set()
  })
  const currentMutedUsers = computed((): Set<UserId> => {
    const session = qallSession.value
    if (!session) return new Set()

    const mutedUsers = new Set<UserId>()
    userStateMap.value.forEach((userState, userId) => {
      const isMuted = userState.sessionStates.some(
        s => s.sessionId === session.sessionId && s.states.includes('micmuted')
      )
      if (isMuted) {
        mutedUsers.add(userId)
      }
    })
    return mutedUsers
  })

  const setRTCState = (payload: readonly WebRTCUserState[]) => {
    const userStateMapVal = new Map<UserId, UserRTCState>()
    const channelSessionsMapVal = new Map<ChannelId, Set<SessionId>>()
    const sessionInfoMapVal = new Map<SessionId, SessionInfo>()
    const sessionUsersMapVal = new Map<SessionId, Set<UserId>>()

    payload.forEach(rtcState => {
      const userSessionState = toUserRTCState(rtcState)
      if (!isSessionCompatible(channelSessionsMapVal, userSessionState)) {
        throw 'channel session conflict'
      }

      userStateMapVal.set(rtcState.userId, userSessionState)
      channelSessionsMapVal.set(
        rtcState.channelId,
        new Set(userSessionState.sessionStates.map(s => s.sessionId))
      )
      userSessionState.sessionStates.forEach(s => {
        if (sessionInfoMapVal.has(s.sessionId)) {
          sessionUsersMapVal.get(s.sessionId)?.add(rtcState.userId)
        } else {
          const newSessionInfo = toSessionInfo(s.sessionId, rtcState.channelId)
          sessionInfoMapVal.set(s.sessionId, newSessionInfo)
          sessionUsersMapVal.set(s.sessionId, new Set([rtcState.userId]))
        }
      })
    })

    userStateMap.value = userStateMapVal
    channelSessionsMap.value = channelSessionsMapVal
    sessionInfoMap.value = sessionInfoMapVal
    sessionUsersMap.value = sessionUsersMapVal
  }

  /** サーバーの情報をローカルに反映する */
  const updateRTCState = (payload: Readonly<WebRTCUserState>) => {
    const userSessionState = toUserRTCState(payload)
    if (!isSessionCompatible(channelSessionsMap.value, userSessionState)) {
      throw 'channel session conflict'
    }

    const currentSessionIds =
      userStateMap.value
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
      userStateMap.value.delete(payload.userId)
    } else {
      userStateMap.value.set(payload.userId, userSessionState)
    }

    addedSessionIds.forEach(sessionId => {
      if (sessionInfoMap.value.has(sessionId)) {
        sessionUsersMap.value.get(sessionId)?.add(payload.userId)
      } else {
        const newSessionInfo = toSessionInfo(sessionId, payload.channelId)
        const newChannelSessions =
          channelSessionsMap.value.get(payload.channelId) ?? new Set()
        newChannelSessions.add(sessionId)
        channelSessionsMap.value.set(payload.channelId, newChannelSessions)
        sessionInfoMap.value.set(sessionId, newSessionInfo)
        sessionUsersMap.value.set(sessionId, new Set([payload.userId]))
      }
    })

    removedSessionIds.forEach(sessionId => {
      const deleted = sessionUsersMap.value
        .get(sessionId)
        ?.delete(payload.userId)
      if (!deleted) {
        throw 'something went wrong'
      }
      // セッションの最後の一人が消えた
      const isLastUserforSession =
        (sessionUsersMap.value.get(sessionId)?.size ?? 0) === 0
      if (isLastUserforSession) {
        const channelId = sessionInfoMap.value.get(sessionId)?.channelId ?? ''
        const sessionIds = channelSessionsMap.value.get(channelId)
        if (!sessionIds) return
        sessionIds.delete(sessionId)
        sessionInfoMap.value.delete(sessionId)
        if (sessionIds.size === 0) {
          channelSessionsMap.value.delete(channelId)
        }
      }
    })
  }

  const fetchRTCState = async ({
    ignoreCache = false
  }: { ignoreCache?: boolean } = {}) => {
    if (!ignoreCache && rtcStateFetched.value) {
      return
    }

    const [{ data: webRTCStates }, shared] = await getWebRTCState()
    if (!shared) {
      setRTCState(webRTCStates)
      rtcStateFetched.value = true
    }
  }

  /** サーバーに状態を追加するリクエストを送信する */
  const addRTCSession = (channelId: ChannelId, state: UserSessionState) => {
    const currentState = currentRTCState.value ?? {
      channelId,
      sessionStates: []
    }

    postRTCState({
      channelId: currentState.channelId,
      sessionStates: [...currentState.sessionStates, state]
    })
  }

  /** サーバーに状態を削除するリクエストを送信する */
  const removeRTCSession = (sessionId: SessionId) => {
    const currentState = currentRTCState.value
    if (!currentState) return

    const sessionStates = currentState.sessionStates.filter(
      s => s.sessionId !== sessionId
    )

    if (sessionStates.length === 0) {
      postRTCState(null)
    } else {
      postRTCState({
        channelId: currentState.channelId,
        sessionStates: sessionStates
      })
    }
  }

  /** サーバーに状態を変更するリクエストを送信する */
  const modifyRTCSession = (sessionId: SessionId, states: string[]) => {
    const currentState = currentRTCState.value
    if (!currentState) return

    const index = currentState.sessionStates.findIndex(
      s => s.sessionId === sessionId
    )
    if (index < 0) return
    const newSessionStates = [...currentState.sessionStates]
    newSessionStates[index] = { sessionId, states }

    postRTCState({
      channelId: currentState.channelId,
      sessionStates: newSessionStates
    })
  }

  wsListener.on('USER_WEBRTC_STATE_CHANGED', dataSnake => {
    const data = formatSnakeKeysToCamelShallow(dataSnake) as WebRTCUserState
    updateRTCState(data)
  })
  wsListener.on('reconnect', () => {
    fetchRTCState({ ignoreCache: true })
  })

  return {
    userStateMap,
    channelSessionsMap,
    sessionInfoMap,
    qallSession,
    currentRTCState,
    currentSessionUsers,
    currentMutedUsers,
    fetchRTCState,
    getChannelRTCSessionId,
    addRTCSession,
    removeRTCSession,
    modifyRTCSession
  }
})

export const useDomainRtcStore = convertToRefsStore(useDomainRtcStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useDomainRtcStorePinia, import.meta.hot)
  )
}
