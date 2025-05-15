import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import {
  createStampPaletteEditProps,
  type settingsStampPaletteEditRouteName
} from '/@/components/Settings/StampTab/StampPalette/stampPaletteEditRoute'

const settingsRouteNamePrefix = 'settings'
export type SettingsRouteName =
  | 'settingsProfile'
  | 'settingsSession'
  | 'settingsBrowser'
  | 'settingsQall'
  | 'settingsStamp'
  | 'settingsTheme'
  | 'settingsAudio'
  | 'settingsStampPaletteCreate'
  | typeof settingsStampPaletteEditRouteName

export const isSettingsRouteName = (
  name: string
): name is SettingsRouteName => {
  return (
    name.startsWith(settingsRouteNamePrefix) &&
    name.slice(settingsRouteNamePrefix.length) !== ''
  )
}

const pathByRouteName = (routeName: SettingsRouteName) => {
  switch (routeName) {
    case 'settingsProfile':
      return 'profile'
    case 'settingsSession':
      return 'session'
    case 'settingsBrowser':
      return 'browser'
    case 'settingsQall':
      return 'qall'
    case 'settingsStamp':
      return 'stamp'
    case 'settingsTheme':
      return 'theme'
    case 'settingsAudio':
      return 'audio'
    case 'settingsStampPaletteCreate':
      return 'stamp-palette/new'
    case 'settingsStampPaletteEdit':
      return 'stamp-palette/:id'
  }
}

const Profile = () => import('/@/views/Settings/ProfileTab.vue')
const Session = () => import('/@/views/Settings/SessionTab.vue')
const Browser = () => import('/@/views/Settings/BrowserTab.vue')
const Qall = () => import('/@/views/Settings/QallTab.vue')
const Stamp = () => import('/@/views/Settings/StampTab.vue')
const Theme = () => import('/@/views/Settings/ThemeTab.vue')
const Audio = () => import('/@/views/Settings/AudioTab.vue')
const StampPaletteCreate = () =>
  import(
    '/@/components/Settings/StampTab/StampPalette/StampPaletteCreateTab.vue'
  )
const StampPaletteEdit = () =>
  import('/@/components/Settings/StampTab/StampPalette/StampPaletteEditTab.vue')

type RouteOptions = {
  props?: RouteRecordRaw['props']
}

const createRoute = (
  name: SettingsRouteName,
  component: Component,
  options?: RouteOptions
) => {
  const route: RouteRecordRaw = {
    name,
    path: pathByRouteName(name),
    component
  }
  if (options?.props) {
    route.props = options.props
  }
  return route
}

export const settingsRoutes: RouteRecordRaw[] = [
  createRoute('settingsProfile', Profile),
  createRoute('settingsSession', Session),
  createRoute('settingsBrowser', Browser),
  createRoute('settingsQall', Qall),
  createRoute('settingsStamp', Stamp),
  createRoute('settingsTheme', Theme),
  createRoute('settingsAudio', Audio),
  createRoute('settingsStampPaletteCreate', StampPaletteCreate),
  createRoute('settingsStampPaletteEdit', StampPaletteEdit, {
    props: r => {
      return createStampPaletteEditProps(String(r.params['id']))
    }
  })
]

export const defaultSettingsName: SettingsRouteName = 'settingsProfile'
export const constructSettingsPath = (routeName: SettingsRouteName) =>
  `/settings/${pathByRouteName(routeName)}`
