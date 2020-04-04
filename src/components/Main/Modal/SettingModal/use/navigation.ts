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
  qall: '通話',
  stamp: 'スタンプ',
  theme: 'テーマ'
}

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType
>('profile')
