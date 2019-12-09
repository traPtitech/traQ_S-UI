import { createMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = createMutations<S>()({
  decrement(state, num: number) {
    state.count -= num
  }
})
