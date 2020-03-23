import createNavigation from '@/use/abstractNavigation'

export type NavigationItemType = 'profile' | 'groups' | 'tags'

// TODO: 言語系リソースの置き場所
export const navigationTypeNameMap: Record<NavigationItemType, string> = {
  profile: 'プロフィール',
  groups: 'ユーザーグループ',
  tags: 'タグ'
}

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType
>('profile')
