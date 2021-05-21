import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  addSearchHistory(state, history: string) {
    state.searchHistories.unshift(history)
    state.searchHistories = state.searchHistories.slice(0, 5)
  }
})
