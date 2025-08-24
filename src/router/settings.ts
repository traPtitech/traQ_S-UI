import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import {
  settingsStampPaletteRoutes,
  type SettingsStampPaletteRouteName
} from './settingsStampPalette'

const settingsRouteNamePrefix = 'settings'
export const settingsStampPaletteRouteName = 'settingsStampPalette'
export type SettingsRouteName =
  | 'settingsProfile'
  | 'settingsSession'
  | 'settingsBrowser'
  | 'settingsQall'
  | 'settingsStamp'
  | typeof settingsStampPaletteRouteName
  | 'settingsTheme'
  | 'settingsAudio'
  | 'settingsFeatureFlag'

export const isSettingsRouteName = (
  name: string
): name is SettingsRouteName | SettingsStampPaletteRouteName => {
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
    case 'settingsStampPalette':
      return 'stamp-palette'
    case 'settingsTheme':
      return 'theme'
    case 'settingsAudio':
      return 'audio'
    case 'settingsFeatureFlag':
      return 'feature-flag'
  }
}

const Profile = () => import('/@/views/Settings/ProfileTab.vue')
const Session = () => import('/@/views/Settings/SessionTab.vue')
const Browser = () => import('/@/views/Settings/BrowserTab.vue')
const Qall = () => import('/@/views/Settings/QallTab.vue')
const Stamp = () => import('/@/views/Settings/StampTab.vue')
const StampPalette = () =>
  import('/@/views/Settings/StampPaletteTab/StampPaletteTab.vue')
const Theme = () => import('/@/views/Settings/ThemeTab.vue')
const Audio = () => import('/@/views/Settings/AudioTab.vue')
const FeatureFlag = () => import('/@/views/Settings/FeatureFlagTab.vue')

const createRoute = (
  name: SettingsRouteName,
  component: Component,
  children?: RouteRecordRaw[]
) => {
  const route: RouteRecordRaw = {
    name,
    path: pathByRouteName(name),
    component: component,
    children: children
  }
  return route
}

export const settingsRoutes: RouteRecordRaw[] = [
  createRoute('settingsProfile', Profile),
  createRoute('settingsSession', Session),
  createRoute('settingsBrowser', Browser),
  createRoute('settingsQall', Qall),
  createRoute('settingsStamp', Stamp),
  createRoute('settingsStampPalette', StampPalette, settingsStampPaletteRoutes),
  createRoute('settingsTheme', Theme),
  createRoute('settingsAudio', Audio),
  createRoute('settingsFeatureFlag', FeatureFlag)
]

export const defaultSettingsName: SettingsRouteName = 'settingsProfile'
export const constructSettingsPath = (routeName: SettingsRouteName) =>
  `/settings/${pathByRouteName(routeName)}`
