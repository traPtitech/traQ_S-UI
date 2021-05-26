import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  addSearchHistory(state, newHistory: string) {
    const index = state.searchHistories.indexOf(newHistory)
    if (index !== -1) {
      state.searchHistories.splice(index, 1)
    }

    state.searchHistories.unshift(newHistory)
    if (state.searchHistories.length > 5) {
      state.searchHistories.pop()
    }
  },
  removeSearchHistory(state, oldHistory: string) {
    const index = state.searchHistories.indexOf(oldHistory)
    if (index !== -1) {
      state.searchHistories.splice(index, 1)
    }
  }
})
