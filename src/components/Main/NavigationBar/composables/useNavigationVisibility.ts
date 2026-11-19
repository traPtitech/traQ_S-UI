import { computed, inject, provide } from 'vue'
import type { InjectionKey, Ref } from 'vue'

type NavigationVisibility = Readonly<Ref<boolean>>

const navigationVisibilityKey: InjectionKey<NavigationVisibility> = Symbol(
  'navigationVisibility'
)
const defaultVisibility = computed(() => true)

export const useNavigationVisibility = () =>
  inject(navigationVisibilityKey, defaultVisibility)

export const provideNavigationVisibility = (
  isVisible: NavigationVisibility
) => {
  const parentVisibility = useNavigationVisibility()

  provide(
    navigationVisibilityKey,
    computed(() => parentVisibility.value && isVisible.value)
  )
}
