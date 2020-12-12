import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ThemeType } from '.'
import { overwrite } from '@/lib/util/object'

export const mutations = defineMutations<S>()({
  set(state: S, newState: Partial<S>) {
    overwrite(state, newState)
  },
  setCurrentTheme(state, type: ThemeType) {
    state.type = type
  },
  setIsOsDarkTheme(state, isOsDarkTheme: boolean) {
    state.isOsDarkTheme = isOsDarkTheme
  }
})
