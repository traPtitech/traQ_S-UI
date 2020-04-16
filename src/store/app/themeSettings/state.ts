import { Theme } from '@/types/theme'
import { lightTheme } from './default'

export interface S {
  type: 'light' | 'dark' | 'custom'
  custom: Theme
}

export const state: S = {
  type: 'light',
  custom: lightTheme
}
