import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  isActivityModeAll(state) {
    return state.activityMode.all
  },
  isActivityModePerChannel(state) {
    return state.activityMode.perChannel
  },
  defaultChannelName(state) {
    switch (state.openMode) {
      case 'lastOpen':
        return state.lastOpenChannelName
      case 'particular':
        return state.openChannelName
      default: {
        const invalid: never = state.openMode
        // eslint-disable-next-line no-console
        console.warn('Invalid app.browserSettings.openMode:', invalid)
        return state.openChannelName
      }
    }
  }
})
