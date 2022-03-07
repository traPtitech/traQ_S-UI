import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  addSearchHistory(state, newHistory: string) {
    const index = state.messageSearchHistories.indexOf(newHistory)
    if (index !== -1) {
      state.messageSearchHistories.splice(index, 1)
    }

    state.messageSearchHistories.unshift(newHistory)
    if (state.messageSearchHistories.length > 5) {
      state.messageSearchHistories.pop()
    }
  },
  removeSearchHistory(state, oldHistory: string) {
    const index = state.messageSearchHistories.indexOf(oldHistory)
    if (index !== -1) {
      state.messageSearchHistories.splice(index, 1)
    }
  }
})
