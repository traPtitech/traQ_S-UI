import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { overwrite } from '@/lib/util/object'

export const mutations = defineMutations<S>()({
  set(state: S, newState: Partial<S>) {
    overwrite(state, newState)
  }
})
