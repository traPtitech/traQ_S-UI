import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setInitialFetchCompleted(state: S) {
    state.initialFetchCompleted = true
  }
})
