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
