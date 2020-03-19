import { reactive } from '@vue/composition-api'

export type NavigationItemType =
  | 'home'
  | 'channels'
  | 'activity'
  | 'users'
  | 'services'

// TOOD: 言語系リソースの置き場所
export const navigationTypeNameMap: Record<NavigationItemType, string> = {
  home: 'ホーム',
  channels: 'チャンネル',
  activity: 'アクティビティ',
  users: 'ユーザー',
  services: 'サービス'
}

export const navigationChangeEvent = 'navigation-change'

const useNavigationSelector = () => {
  const navigationSelectorState = reactive({
    currentNavigation: 'home' as NavigationItemType
  })
  const onNavigationChange = (type: NavigationItemType) => {
    navigationSelectorState.currentNavigation = type
  }
  return {
    navigationSelectorState,
    onNavigationChange
  }
}

export default useNavigationSelector
