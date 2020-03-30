import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  isEmpty(state) {
    return state.attachments.length === 0
  }
})
