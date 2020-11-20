import createNavigation from '@/use/abstractNavigation'

export type NavigationItemType =
  | 'home'
  | 'channels'
  | 'activity'
  | 'users'
  | 'clips'

/**
 * 特定の状況に応じて表示されるナビゲーションコンポーネント用の種別
 *
 * 「選択しない」を許すのでnullable
 */
export type EphemeralNavigationItemType = 'qall' | undefined

// TODO: 言語系リソースの置き場所
export const navigationTypeNameMap: Record<NavigationItemType, string> = {
  home: 'ホーム',
  channels: 'チャンネル',
  activity: 'アクティビティ',
  users: 'ユーザー',
  clips: 'クリップ'
}

export const ephemeralNavigationTypeNameMap: Record<
  NonNullable<EphemeralNavigationItemType>,
  string
> = {
  qall: 'Qall'
}

export const {
  useNavigation,
  useNavigationSelectorItem
} = createNavigation<NavigationItemType>('home')

export const {
  useNavigation: useEphemeralNavigation,
  useNavigationSelectorItem: useEphemeralNavigationSelectorItem
} = createNavigation<EphemeralNavigationItemType>(
  undefined,
  'ephemeral-navigation-change'
)
