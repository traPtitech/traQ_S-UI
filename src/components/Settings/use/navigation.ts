import { SettingsRouteName } from '@/router/settings'
import { useRouter } from 'vue-router'
import { RouteName } from '@/router'
import store from '@/store'

export type NavigationItemType =
  | 'profile'
  | 'browser'
  | 'qall'
  | 'stamp'
  | 'theme'

// TODO: 言語系リソースの置き場所
export const navigationRouteNameTitleMap: Record<SettingsRouteName, string> = {
  settingsProfile: 'プロフィール',
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
    routeName: 'settingsBrowser',
    iconName: 'cogs',
    iconMdi: true
  },
  {
    routeName: 'settingsQall',
    iconName: 'phone',
    iconMdi: true
  },
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
    router.push({ name: RouteName.Index, query: { lastOpen: 'true' } })
  const back = () => {
    if (store.state.ui.settings.settingsRootShown) {
      router.back()
    } else {
      router.push({ name: RouteName.Settings })
    }
  }
  return { close, back }
}
export default useSettingsNavigation
