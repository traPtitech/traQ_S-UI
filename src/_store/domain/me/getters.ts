import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  myId(state) {
    return state.detail?.id
  },
  isLoggedIn(state) {
    return state.detail !== undefined
  }
})
