import { Theme } from '@/types/theme'
import { lightTheme } from './default'
import { ThemeType } from '@/store/app/themeSettings/index'

export interface S {
  type: ThemeType
  custom: Theme
}

export const state: S = {
  type: 'light',
  custom: lightTheme
}
