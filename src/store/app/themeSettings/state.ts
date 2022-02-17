import { Theme } from '/@/lib/theme/schema'
import { ThemeType } from '.'

export interface S {
  type: ThemeType
  isOsDarkTheme: boolean
  custom: Theme
}

export const state: S = {
  type: 'auto',
  isOsDarkTheme: false,
  custom: { basic: window.defaultLightTheme }
}
