import { defineMutations } from 'direct-vuex'
import { S } from './state'

export const mutations = defineMutations<S>()({
  setAll<K extends keyof S>(state: S, newState: Partial<S>) {
    ;(Object.keys(newState) as K[]).forEach(key => {
      state[key] = newState[key] as S[K]
    })
  }
})
