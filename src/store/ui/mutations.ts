import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setIsMobile: (state: S, isMobile: boolean) => {
    state.isMobile = isMobile
  }
})
