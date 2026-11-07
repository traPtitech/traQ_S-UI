import createNavigation from '/@/composables/useAbstractNavigation'

export type NavigationItemType =
  'home' | 'channels' | 'activity' | 'users' | 'clips'

/**
 * 特定の状況に応じて表示されるナビゲーションコンポーネント用の種別
 *
 * 「選択しない」を許すのでnullable
 */
export type EphemeralNavigationItemType =
  'qallController' | 'draftList' | 'audioController' | undefined

// TODO: 言語系リソースの置き場所
export const navigationTypeNameMap = {
  home: 'ホーム',
  channels: 'チャンネル',
  activity: 'アクティビティ',
  users: 'ユーザー',
  clips: 'クリップ'
} satisfies Record<NavigationItemType, string>

export const ephemeralNavigationTypeNameMap = {
  qallController: 'Qall',
  draftList: '下書き一覧',
  audioController: '音楽'
} satisfies Record<NonNullable<EphemeralNavigationItemType>, string>

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType,
  'navigationChange'
>('home', 'navigationChange')

export const {
  useNavigation: useEphemeralNavigation,
  useNavigationSelectorItem: useEphemeralNavigationSelectorItem
} = createNavigation<EphemeralNavigationItemType, 'ephemeralNavigationChange'>(
  undefined,
  'ephemeralNavigationChange'
)
