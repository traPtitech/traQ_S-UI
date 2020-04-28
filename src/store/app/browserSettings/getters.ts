import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  isActivityModeAll(state) {
    return state.activityMode.all
  },
  isActivityModePerChannel(state) {
    return state.activityMode.perChannel
  }
})
