import { createMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = createMutations<S>()({
  setViewportWidth: (state: S, width: number) => {
    state.viewportWidth = width
  }
})
