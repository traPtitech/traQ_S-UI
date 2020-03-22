import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  shouldShowModal(state) {
    return state.modalState.length > 0
  }
})
