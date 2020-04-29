import createNavigation from '@/use/abstractNavigation'

export type NavigationItemType =
  | 'profile'
  | 'browser'
  | 'qall'
  | 'stamp'
  | 'theme'

// TODO: 言語系リソースの置き場所
export const navigationTypeNameMap: Record<NavigationItemType, string> = {
  profile: 'プロフィール',
  browser: 'ブラウザ',
  qall: '通話 (Qall)',
  stamp: 'スタンプ',
  theme: 'テーマ'
}

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType
>('profile')

export const navigations: {
  type: NavigationItemType
  iconName: string
  iconMdi?: true
}[] = [
  {
    type: 'profile',
    iconName: 'user'
  },
  {
    type: 'browser',
    iconName: 'cogs',
    iconMdi: true
  },
  {
    type: 'qall',
    iconName: 'phone',
    iconMdi: true
  },
  {
    type: 'stamp',
    iconName: 'emoticon-outline',
    iconMdi: true
  },
  {
    type: 'theme',
    iconName: 'brightness-6',
    iconMdi: true
  }
]
