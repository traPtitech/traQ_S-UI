import type { InjectionKey, Ref } from 'vue'
import { inject, provide, watch } from 'vue'

const mainViewActivityKey: InjectionKey<Readonly<Ref<boolean>>> =
  Symbol('mainViewActivity')

export const provideMainViewActivity = (isActive: Readonly<Ref<boolean>>) => {
  provide(mainViewActivityKey, isActive)
}

export const useCloseOnMainViewInactive = (close: () => void) => {
  const isActive = inject(mainViewActivityKey, null)
  if (!isActive) return

  watch(isActive, active => {
    if (!active) close()
  })
}
