import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { overwrite } from '/@/lib/basic/object'

export const mutations = defineMutations<S>()({
  set(state, newState: Partial<S>) {
    overwrite(state, newState)
  }
})
