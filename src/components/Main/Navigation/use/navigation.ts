import createNavigation from '@/use/abstractNavigation'

export type NormalNavigationItemType =
  | 'home'
  | 'channels'
  | 'activity'
  | 'users'
  | 'services'
  | 'clips'

export type EphemeralNavigationItemType = 'qall'

export type NavigationItemType =
  | NormalNavigationItemType
  | EphemeralNavigationItemType

// TODO: 言語系リソースの置き場所
export const navigationTypeNameMap: Record<NavigationItemType, string> = {
  home: 'ホーム',
  channels: 'チャンネル',
  activity: 'アクティビティ',
  users: 'ユーザー',
  services: 'サービス',
  clips: 'クリップ',
  qall: 'Qall'
}

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType
>('home')

