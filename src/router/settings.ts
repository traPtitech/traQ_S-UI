import { Component, defineAsyncComponent } from 'vue'
import { RouteRecordRaw } from 'vue-router'

export enum SettingsRouteName {
  Profile = 'profileSettings',
  Browser = 'browserSettings',
  Qall = 'qallSettings',
  Stamp = 'stampSettings',
  Theme = 'themeSettings'
}

export const settingsRouteNamePathMap: Record<SettingsRouteName, string> = {
  [SettingsRouteName.Profile]: 'profile',
  [SettingsRouteName.Browser]: 'browser',
  [SettingsRouteName.Qall]: 'qall',
  [SettingsRouteName.Stamp]: 'stamp',
  [SettingsRouteName.Theme]: 'theme'
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
  createRoute(SettingsRouteName.Profile, Profile),
  createRoute(SettingsRouteName.Browser, Browser),
  createRoute(SettingsRouteName.Qall, Qall),
  createRoute(SettingsRouteName.Stamp, Stamp),
  createRoute(SettingsRouteName.Theme, Theme)
]

export const defaultSettingsName = SettingsRouteName.Profile
export const constructSettingsPath = (routeName: SettingsRouteName) =>
  `/settings/${settingsRouteNamePathMap[routeName]}`
