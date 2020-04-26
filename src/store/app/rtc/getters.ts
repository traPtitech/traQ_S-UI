import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  qallSession(state) {
    return state.currentRTCState?.sessionStates.find(
      s => state.sessionInfoMap[s.sessionId]?.type === 'qall'
    )
  }
})
