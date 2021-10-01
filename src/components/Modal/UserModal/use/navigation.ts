import createNavigation from '/@/use/abstractNavigation'

export type NavigationItemType = 'profile' | 'groups' | 'tags'

export const { useNavigation, useNavigationSelectorItem } = createNavigation<
  NavigationItemType,
  'navigationChange'
>('profile', 'navigationChange')
