import { defineGetters } from 'direct-vuex'
import { S } from './state'

export const getters = defineGetters<S>()({
  shouldShowStampPicker(state) {
    return state.targetPortalName.length > 0
  }
})
