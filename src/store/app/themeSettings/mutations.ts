import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { ThemeType } from '@/store/app/themeSettings/index'
import themeSchema from './themeSchema.json'
import Ajv from 'ajv'

export const mutations = defineMutations<S>()({
  /**
   * keyに一致しないvalueを入れることができるので注意
   */
  set<K extends keyof S>(state: S, [key, value]: [K, S[K]]) {
    if (key === 'custom') {
      const ajv = new Ajv()
      const validate = ajv.compile(themeSchema.definitions.Theme)
      if (validate(value)) {
        state[key] = value
      } else {
        //console.log(validate.errors)
      }
    } else {
      state[key] = value
    }
  },

  setCurrentTheme(state, type: ThemeType) {
    state.type = type
  },
  setIsOsDarkTheme(state, isOsDarkTheme: boolean) {
    state.isOsDarkTheme = isOsDarkTheme
  }
})
