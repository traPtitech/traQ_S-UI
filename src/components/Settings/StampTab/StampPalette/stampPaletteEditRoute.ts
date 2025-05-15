import type { RouteLocationRaw } from 'vue-router'
export const settingsStampPaletteEditRouteName = 'settingsStampPaletteEdit'

export interface StampPaletteEditProps {
  id: string
}

export const createStampPaletteEditProps = (
  id: string
): StampPaletteEditProps => {
  return {
    id: id
  }
}

export const createStampPaletteEditLocation = (
  id: string
): RouteLocationRaw => ({
  name: settingsStampPaletteEditRouteName,
  params: {
    id: id
  }
})
