import store from '@/store'
import { computed } from '@vue/composition-api'
import { NavigationItemType, EphemeralNavigationItemType } from './navigation'
import { ThemeClaim } from '@/lib/styles'

export type NavigationSelectorEntry = {
  type: NavigationItemType
  iconName: string
  iconMdi?: boolean
}

export type EphemeralNavigationSelectorEntry = {
  type: EphemeralNavigationItemType
  iconName: string
  iconMdi?: boolean
  colorClaim?: ThemeClaim<string> // 色
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
    type: 'clips',
    iconName: 'bookmark',
    iconMdi: true
  }
]
export const ephemeralItems: Record<
  NonNullable<EphemeralNavigationItemType>,
  EphemeralNavigationSelectorEntry
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
  const entries = computed(() => items)
  const ephemeralEntries = computed(
    () =>
      [hasActiveQallSession.value ? ephemeralItems.qall : undefined].filter(
        e => !!e
      ) as EphemeralNavigationSelectorEntry[]
  )
  return {
    entries,
    ephemeralEntries
  }
}
export default useNavigationSelectorEntry
