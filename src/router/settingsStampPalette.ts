import { type Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export type SettingsStampPaletteRouteName =
  | 'settingsStampPaletteCreate'
  | 'settingsStampPaletteDetail'

const pathByRouteName = (routeName: SettingsStampPaletteRouteName) => {
  switch (routeName) {
    case 'settingsStampPaletteCreate':
      return 'new'
    case 'settingsStampPaletteDetail':
      return ':paletteId'
  }
}

const StampPaletteCreate = () =>
  import('/@/views/Settings/StampPaletteTab/StampPaletteCreateTab.vue')
const StampPaletteDetail = () =>
  import('/@/views/Settings/StampPaletteTab/StampPaletteDetailTab.vue')

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
  createRoute('settingsStampPaletteDetail', StampPaletteDetail, true)
]

export const constructSettingsStampPaletteCreatePath = () =>
  `/settings/stamp-palette/${pathByRouteName('settingsStampPaletteCreate')}`
export const constructSettingsStampPaletteDetailPath = (paletteId: string) =>
  `/settings/stamp-palette/${paletteId}`
