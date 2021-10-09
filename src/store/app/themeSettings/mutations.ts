import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ThemeType } from '.'
import { overwrite } from '/@/lib/basic/object'

export const mutations = defineMutations<S>()({
  set(state, newState: Partial<S>) {
    overwrite(state, newState)
  },
  setCurrentTheme(state, type: ThemeType) {
    state.type = type
  },
  setIsOsDarkTheme(state, isOsDarkTheme: boolean) {
    state.isOsDarkTheme = isOsDarkTheme
  }
})
