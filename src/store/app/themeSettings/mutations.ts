import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  /**
   * keyに一致しないvalueを入れることができるので注意
   */
  set<K extends keyof S>(state: S, [key, value]: [K, S[K]]) {
    state[key] = value
  }
})
