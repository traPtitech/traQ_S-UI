import { defineGetters } from 'direct-vuex'
import { S, SessionType } from './state'
import { ChannelId, UserId } from '@/types/entity-ids'
import { getTalkingLoundnessLevel } from '@/lib/audioStreamMixer'
import { rtc } from '.'
import { moduleGetterContext } from '@/_store'

const rtcGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, rtc)

export const getters = defineGetters<S>()({
  qallSession(state) {
    return state.currentRTCState?.sessionStates.find(
      s => state.sessionInfoMap[s.sessionId]?.type === 'qall'
    )
  },
  channelRTCSessionId: state => (
    sessionType: SessionType,
    channelId: ChannelId
  ) => {
    return state.channelSessionsMap[channelId]?.find(
      sessionId => state.sessionInfoMap[sessionId]?.type === sessionType
    )
  },
  currentSessionUsers(...args): UserId[] {
    const { state, getters } = rtcGetterContext(args)
    const session = getters.qallSession
    if (!session) return []
    return state.sessionUsersMap[session.sessionId] ?? []
  },
  currentMutedUsers(...args): UserId[] {
    const { state, getters } = rtcGetterContext(args)
    const session = getters.qallSession
    if (!session) return []
    return Object.entries(state.userStateMap)
      .filter(([_, state]) =>
        state?.sessionStates.some(
          s =>
            s.sessionId === session.sessionId && s.states.includes('micmuted')
        )
      )
      .map(([id]) => id)
  },
  getTalkingLoudnessLevel: state => (userId: UserId) => {
    const level = state.mixer?.getLevelOf(userId)
    return getTalkingLoundnessLevel(level)
  }
})
