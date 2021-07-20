import store from '/@/store'
import {
  Theme,
  ThemeVariables,
  TransparentThemeVariables,
  CSSCommonVariables
} from '/@/types/theme'
import { computed } from 'vue'
import * as CSS from 'csstype'

export type ThemeClaim<T> = (
  theme: Readonly<Theme>,
  common: typeof commonStyles
) => T

export type ThemeVariablesOrProperties =
  | CSS.Properties
  | ThemeVariables
  | TransparentThemeVariables
  | CSSCommonVariables

export const makeStyles = (claim: ThemeClaim<ThemeVariablesOrProperties>) => {
  return computed(() =>
    claim(store.getters.app.themeSettings.currentTheme, commonStyles)
  )
}

/** テーマに依存しない色 */
export const commonStyles = {
  text: {
    whitePrimary: '#ffffff',
    whiteSecondary: 'rgba(255, 255, 255, 0.5)',
    black: '#222222'
  },
  ui: {
    qall: '#00ACA2',
    muted: '#F26451',
    pin: '#f2ba4a'
  },
  background: {
    overlay: 'rgba(25, 26, 29, 0.5)',
    black: '#22262A',
    pin: 'rgba(242, 186, 74, 0.2)'
  },
  dropShadow: {
    default: 'drop-shadow(0 2px 4px rgba(33, 63, 99, 0.3))'
  }
} as const
export type CommonStyles = typeof commonStyles
