import store from '@/store'
import { Theme } from '@/types/theme'
import { computed } from '@vue/composition-api'
import * as CSS from 'csstype'

type ThemeClaim = (theme: Theme) => CSS.Properties

export const makeStyles = (claim: ThemeClaim) => {
  return computed(() => claim(store.state.app.theme))
}

export const fade = (color: string, opacity: number) => {
  if (color.startsWith('#')) {
    return fadeHex(color, opacity)
  }
  throw `Invalid color value: ${color}`
}

const fadeHex = (hex: string, opacity: number) => {
  const _opacity = Math.max(0, Math.min(1, opacity))
  if (hex.length === 7) {
    return `${hex}${Math.round(_opacity * 255)
      .toString(16)
      .padStart(2, '0')}`
  }
  if (hex.length === 4) {
    return `${hex}${Math.round(_opacity * 16).toString(16)}`
  }
  throw `Invalid hex color value: ${hex}`
}
