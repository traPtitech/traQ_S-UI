import { type Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export type SettingsStampPaletteRouteName =
  | 'settingsStampPaletteCreate'
  | 'settingsStampPaletteEdit'

const pathByRouteName = (routeName: SettingsStampPaletteRouteName) => {
  switch (routeName) {
    case 'settingsStampPaletteCreate':
      return 'new'
    case 'settingsStampPaletteEdit':
      return ':paletteId'
  }
}

const StampPaletteCreate = () =>
  import('/@/views/Settings/StampPalette/StampPaletteCreateTab.vue')
const StampPaletteEdit = () =>
  import('/@/views/Settings/StampPalette/StampPaletteEditTab.vue')

const createRoute = (
  name: SettingsStampPaletteRouteName,
  component: Component,
  props?: boolean
) => {
  const route: RouteRecordRaw = {
    name,
    path: pathByRouteName(name),
    component: component,
    props: props
  }
  return route
}

export const settingsStampPaletteRoutes: RouteRecordRaw[] = [
  createRoute('settingsStampPaletteCreate', StampPaletteCreate),
  createRoute('settingsStampPaletteEdit', StampPaletteEdit, true)
]

export const constructSettingsStampPaletteCreatePath = () =>
  `/settings/stamp-palette/${pathByRouteName('settingsStampPaletteCreate')}`
export const constructSettingsStampPaletteEditPath = (paletteId: string) =>
  `/settings/stamp-palette/${paletteId}`
