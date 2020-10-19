import { Component, defineAsyncComponent } from 'vue'
import { RouteRecordRaw } from 'vue-router'

const settingsRouteNamePrefix = 'settings'
export type SettingsRouteName =
  | 'settingsProfile'
  | 'settingsBrowser'
  | 'settingsQall'
  | 'settingsStamp'
  | 'settingsTheme'

export const isSettingsRouteName = (
  name: string
): name is SettingsRouteName => {
  return (
    name.startsWith(settingsRouteNamePrefix) &&
    name.slice(settingsRouteNamePrefix.length) !== ''
  )
}

export const settingsRouteNamePathMap: Record<SettingsRouteName, string> = {
  settingsProfile: 'profile',
  settingsBrowser: 'browser',
  settingsQall: 'qall',
  settingsStamp: 'stamp',
  settingsTheme: 'theme'
}

const Profile = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "SettingsProfile" */ '@/views/Settings/ProfileTab.vue'
    )
)
const Browser = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "SettingsBrowser" */ '@/views/Settings/BrowserTab.vue'
    )
)
const Qall = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "SettingsQall" */ '@/views/Settings/QallTab.vue'
    )
)
const Stamp = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "SettingsStamps" */ '@/views/Settings/StampTab.vue'
    )
)
const Theme = defineAsyncComponent(
  () =>
    import(
      /* webpackChunkName: "SettingsTheme" */ '@/views/Settings/ThemeTab.vue'
    )
)

const createRoute = (name: SettingsRouteName, component: Component) => ({
  name,
  path: settingsRouteNamePathMap[name],
  component: component
})

export const settingsRoutes: RouteRecordRaw[] = [
  createRoute('settingsProfile', Profile),
  createRoute('settingsBrowser', Browser),
  createRoute('settingsQall', Qall),
  createRoute('settingsStamp', Stamp),
  createRoute('settingsTheme', Theme)
]

export const defaultSettingsName: SettingsRouteName = 'settingsProfile'
export const constructSettingsPath = (routeName: SettingsRouteName) =>
  `/settings/${settingsRouteNamePathMap[routeName]}`
