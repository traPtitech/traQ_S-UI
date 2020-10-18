import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setSettingsRootShown(state) {
    state.settingsRootShown = true
  },
  resetSettingsRootShown(state) {
    state.settingsRootShown = false
  }
})
