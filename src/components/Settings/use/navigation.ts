import createNavigation from '@/use/abstractNavigation'
import { SettingsRouteName } from '@/router/settings'

export type NavigationItemType =
  | 'profile'
  | 'browser'
  | 'qall'
  | 'stamp'
  | 'theme'

// TODO: 言語系リソースの置き場所
export const navigationRouteNameTitleMap: Record<SettingsRouteName, string> = {
  [SettingsRouteName.Profile]: 'プロフィール',
  [SettingsRouteName.Browser]: 'ブラウザ',
  [SettingsRouteName.Qall]: '通話 (Qall)',
  [SettingsRouteName.Stamp]: 'スタンプ',
  [SettingsRouteName.Theme]: 'テーマ'
}

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType
>('profile')

export const navigations: {
  routeName: SettingsRouteName
  iconName: string
  iconMdi?: true
}[] = [
  {
    routeName: SettingsRouteName.Profile,
    iconName: 'user'
  },
  {
    routeName: SettingsRouteName.Browser,
    iconName: 'cogs',
    iconMdi: true
  },
  {
    routeName: SettingsRouteName.Qall,
    iconName: 'phone',
    iconMdi: true
  },
  {
    routeName: SettingsRouteName.Stamp,
    iconName: 'emoticon-outline',
    iconMdi: true
  },
  {
    routeName: SettingsRouteName.Theme,
    iconName: 'brightness-6',
    iconMdi: true
  }
]
