import { defineGetters } from 'direct-vuex'
import { S } from './state'
import { Theme } from '@/types/theme'
import { lightTheme, darkTheme } from './default'

export const getters = defineGetters<S>()({
  currentTheme(state): Theme {
    switch (state.type) {
      case 'light':
        return lightTheme
      case 'dark':
        return darkTheme
      case 'custom':
        return state.custom
      default:
        const invalid: never = state.type
        // eslint-disable-next-line no-console
        console.warn(`Invalid theme type: ${invalid}`)

        return lightTheme
    }
  }
})
