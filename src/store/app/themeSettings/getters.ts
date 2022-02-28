import { defineGetters } from 'direct-vuex'
import { ThemeType } from '.'
import { S } from './state'
import { resolveTheme, ResolvedTheme } from '/@/lib/theme/resolve'
import { Theme } from '/@/lib/theme/schema'

const lightTheme = window.defaultLightTheme
const darkTheme = window.defaultDarkTheme

const selectTheme = (
  type: ThemeType,
  isOsDarkTheme: boolean,
  customTheme: Theme
) => {
  switch (type) {
    case 'auto':
      return isOsDarkTheme ? darkTheme : lightTheme
    case 'light':
      return lightTheme
    case 'dark':
      return darkTheme
    case 'custom':
      return customTheme
    default: {
      const invalid: never = type
      // eslint-disable-next-line no-console
      console.warn(`Invalid theme type: ${invalid}`)

      return lightTheme
    }
  }
}

export const getters = defineGetters<S>()({
  currentTheme(state): ResolvedTheme {
    const theme = selectTheme(state.type, state.isOsDarkTheme, state.custom)
    return resolveTheme(theme)
  }
})
