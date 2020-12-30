import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setLoginCheckSucceeded(state: S) {
    state.loginCheckSucceeded = true
  },
  setInitialFetchCompleted(state: S) {
    state.initialFetchCompleted = true
  }
})
