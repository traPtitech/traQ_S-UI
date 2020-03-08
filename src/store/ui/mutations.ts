import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setViewportWidth: (state: S, width: number) => {
    state.viewportWidth = width
  }
})
