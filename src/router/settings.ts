import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

const settingsRouteNamePrefix = 'settings'
export type SettingsRouteName =
  | 'settingsProfile'
  | 'settingsSession'
  | 'settingsBrowser'
  | 'settingsQall'
  | 'settingsStamp'
  | 'settingsTheme'
  | 'settingsAudio'

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
  }
}

const Profile = () => import('/@/views/Settings/ProfileTab.vue')
const Session = () => import('/@/views/Settings/SessionTab.vue')
const Browser = () => import('/@/views/Settings/BrowserTab.vue')
const Qall = () => import('/@/views/Settings/QallTab.vue')
const Stamp = () => import('/@/views/Settings/StampTab.vue')
const Theme = () => import('/@/views/Settings/ThemeTab.vue')
const Audio = () => import('/@/views/Settings/AudioTab.vue')

const createRoute = (name: SettingsRouteName, component: Component) => ({
  name,
  path: pathByRouteName(name),
  component: component
})

export const settingsRoutes: RouteRecordRaw[] = [
  createRoute('settingsProfile', Profile),
  createRoute('settingsSession', Session),
  createRoute('settingsBrowser', Browser),
  createRoute('settingsQall', Qall),
  createRoute('settingsStamp', Stamp),
  createRoute('settingsTheme', Theme),
  createRoute('settingsAudio', Audio)
]

export const defaultSettingsName: SettingsRouteName = 'settingsProfile'
export const constructSettingsPath = (routeName: SettingsRouteName) =>
  `/settings/${pathByRouteName(routeName)}`
