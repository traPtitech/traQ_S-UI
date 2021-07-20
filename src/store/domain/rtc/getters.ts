import { defineGetters } from 'direct-vuex'
import { S, SessionType, UserRTCState, UserSessionState } from './state'
import { rtc } from '.'
import { moduleGetterContext } from '/@/store'
import { ChannelId, UserId } from '/@/types/entity-ids'

const rtcGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, rtc)

export const getters = defineGetters<S>()({
  channelRTCSessionId(state) {
    return (sessionType: SessionType, channelId: ChannelId) => {
      const sessionIds = state.channelSessionsMap.get(channelId)
      if (!sessionIds) return
      return [...sessionIds].find(
        sessionId => state.sessionInfoMap.get(sessionId)?.type === sessionType
      )
    }
  },
  currentRTCState(...args): UserRTCState | undefined {
    const { rootGetters, state } = rtcGetterContext(args)
    return state.userStateMap.get(rootGetters.domain.me.myId ?? '')
  },
  qallSession(...args): UserSessionState | undefined {
    const { state, getters } = rtcGetterContext(args)
    return getters.currentRTCState?.sessionStates.find(
      s => state.sessionInfoMap.get(s.sessionId)?.type === 'qall'
    )
  },
  currentSessionUsers(...args): Set<UserId> {
    const { state, getters } = rtcGetterContext(args)
    const session = getters.qallSession
    if (!session) return new Set()
    return state.sessionUsersMap.get(session.sessionId) ?? new Set()
  },
  currentMutedUsers(...args): Set<UserId> {
    const { state, getters } = rtcGetterContext(args)
    const session = getters.qallSession
    if (!session) return new Set()

    const mutedUsers = new Set<UserId>()
    state.userStateMap.forEach((userState, userId) => {
      const isMuted = userState.sessionStates.some(
        s => s.sessionId === session.sessionId && s.states.includes('micmuted')
      )
      if (isMuted) {
        mutedUsers.add(userId)
      }
    })
    return mutedUsers
  }
})
