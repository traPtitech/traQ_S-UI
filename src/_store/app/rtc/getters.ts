import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { UserId } from '@/types/entity-ids'
import { getTalkingLoundnessLevel } from '@/lib/audioStreamMixer'
import { rtc } from '.'
import { moduleGetterContext } from '@/_store'
import store from '@/store'

const rtcGetterContext = (args: [unknown, unknown, unknown, unknown]) =>
  moduleGetterContext(args, rtc)

export const getters = defineGetters<S>()({
  qallSession(state) {
    return state.currentRTCState?.sessionStates.find(
      s =>
        store.state.domain.rtc.sessionInfoMap.get(s.sessionId)?.type === 'qall'
    )
  },
  currentSessionUsers(...args): Set<UserId> {
    const { getters } = rtcGetterContext(args)
    const session = getters.qallSession
    if (!session) return new Set()
    return (
      store.state.domain.rtc.sessionUsersMap.get(session.sessionId) ?? new Set()
    )
  },
  currentMutedUsers(...args): UserId[] {
    const { getters } = rtcGetterContext(args)
    const session = getters.qallSession
    if (!session) return []
    return [...store.state.domain.rtc.userStateMap.entries()]
      .filter(([_, state]) =>
        state.sessionStates.some(
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
