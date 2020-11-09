import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setSettingsRootShown(state, shown) {
    state.settingsRootShown = shown
  }
})
