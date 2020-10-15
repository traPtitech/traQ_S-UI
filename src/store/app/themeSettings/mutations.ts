import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ThemeType } from '@/store/app/themeSettings/index'

export const mutations = defineMutations<S>()({
  /**
   * keyに一致しないvalueを入れることができるので注意
   */
  set<K extends keyof S>(state: S, [key, value]: [K, S[K]]) {
    state[key] = value
  },

  setCurrentTheme(state, type: ThemeType) {
    state.type = type
  },
  setIsOsDarkTheme(state, isOsDarkTheme: boolean) {
    state.isOsDarkTheme = isOsDarkTheme
  }
})
