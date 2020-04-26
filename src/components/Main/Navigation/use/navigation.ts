import createNavigation from '@/use/abstractNavigation'

export type NavigationItemType =
  | 'home'
  | 'channels'
  | 'activity'
  | 'users'
  | 'clips'

// TODO: 言語系リソースの置き場所
export const navigationTypeNameMap: Record<NavigationItemType, string> = {
  home: 'ホーム',
  channels: 'チャンネル',
  activity: 'アクティビティ',
  users: 'ユーザー',
  clips: 'クリップ'
}

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType
>('home')
