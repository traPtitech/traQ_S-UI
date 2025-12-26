import { computed, toRefs } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

export interface AppItem {
  label: string
  iconPath: string
  appLink: string
}

type State = {
  customOrder: string[]
}

const useAppListPinia = defineStore('ui/appList', () => {
  const services = window.traQConfig.services ?? []

  const initialValue: State = {
    customOrder: []
  }

  const [state, restoring, restoringPromise] = useIndexedDbValue(
    'store/ui/appList',
    1,
    {},
    initialValue
  )

  const updateAppOrder = async (newOrder: ReadonlyArray<string>) => {
    await restoringPromise.value
    state.customOrder = [...newOrder]
  }

  const resetToDefaultAppOrder = async () => {
    await restoringPromise.value
    state.customOrder = []
  }

  const displayApps = computed((): ReadonlyArray<AppItem> => {
    if (state.customOrder.length <= 0) return services ?? []

    return [
      ...state.customOrder
        .map(item => services?.find(({ label }) => label === item))
        .filter((item): item is AppItem => !!item),
      ...services.filter(({ label }) => !state.customOrder.includes(label))
    ]
  })

  const hasCustomOrder = computed(() => {
    return state.customOrder.length > 0
  })

  return {
    ...toRefs(state),
    restoring,
    restoringPromise,
    updateAppOrder,
    resetToDefaultAppOrder,
    displayApps,
    hasCustomOrder
  }
})

export const useAppList = convertToRefsStore(useAppListPinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppListPinia, import.meta.hot))
}
