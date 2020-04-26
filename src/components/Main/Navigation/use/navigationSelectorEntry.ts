import store from '@/store'
import { computed } from '@vue/composition-api'
import { NavigationItemType, EphemeralNavigationItemType } from './navigation'
import { ThemeClaim } from '@/lib/styles'

type NavigationSelectorEntry = {
  type: NavigationItemType
  iconName: string
  iconMdi?: boolean
  colorClaim?: ThemeClaim<string>
}

export const items: NavigationSelectorEntry[] = [
  {
    type: 'home',
    iconName: 'home',
    iconMdi: true
  },
  {
    type: 'channels',
    iconName: 'hash'
  },
  {
    type: 'activity',
    iconName: 'activity'
  },
  {
    type: 'users',
    iconName: 'user'
  },
  {
    type: 'services',
    iconName: 'services'
  }
]
export const ephemeralItems: Record<
  EphemeralNavigationItemType,
  NavigationSelectorEntry
> = {
  qall: {
    type: 'qall',
    iconName: 'phone',
    iconMdi: true,
    colorClaim: (_, common) => common.ui.qall
  }
}

const useNavigationSelectorEntry = () => {
  const hasActiveQallSession = computed(() => {
    return !!store.getters.app.rtc.qallSession
  })
  const entries = computed(() =>
    [
      ...items,
      hasActiveQallSession.value ? ephemeralItems.qall : undefined
    ].filter(e => !!e)
  )
  return { entries }
}
export default useNavigationSelectorEntry
