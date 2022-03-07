import { SettingsRouteName } from '/@/router/settings'
import { useRouter } from 'vue-router'
import { constructChannelPath, RouteName } from '/@/router'
import store from '/@/vuex'

const isSkywayApikeySet = window.traQConfig.skyway !== undefined

export type NavigationItemType =
  | 'profile'
  | 'session'
  | 'browser'
  | 'qall'
  | 'stamp'
  | 'theme'

// TODO: 言語系リソースの置き場所
export const navigationRouteNameTitleMap: Record<SettingsRouteName, string> = {
  settingsProfile: 'プロフィール',
  settingsSession: 'セッション',
  settingsBrowser: 'ブラウザ',
  settingsQall: '通話 (Qall)',
  settingsStamp: 'スタンプ',
  settingsTheme: 'テーマ'
}

export const navigations: {
  routeName: SettingsRouteName
  iconName: string
  iconMdi?: true
}[] = [
  {
    routeName: 'settingsProfile',
    iconName: 'user'
  },
  {
    routeName: 'settingsSession',
    iconName: 'key-chain',
    iconMdi: true
  },
  {
    routeName: 'settingsBrowser',
    iconName: 'cogs',
    iconMdi: true
  },
  ...(isSkywayApikeySet
    ? [
        {
          routeName: 'settingsQall',
          iconName: 'phone',
          iconMdi: true
        } as const
      ]
    : []),
  {
    routeName: 'settingsStamp',
    iconName: 'emoticon-outline',
    iconMdi: true
  },
  {
    routeName: 'settingsTheme',
    iconName: 'brightness-6',
    iconMdi: true
  }
]

const useSettingsNavigation = () => {
  const router = useRouter()
  const close = () =>
    router.push(
      constructChannelPath(store.state.app.browserSettings.lastOpenChannelName)
    )
  const showRoot = () => {
    router.push({ name: RouteName.Settings })
  }
  return { close, showRoot }
}
export default useSettingsNavigation
