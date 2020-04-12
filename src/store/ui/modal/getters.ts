import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  shouldShowModal(state) {
    return state.modalState.length > 0 && !state.isClearingModal
  },
  currentState(state) {
    return state.modalState[state.modalState.length - 1]
  }
})
