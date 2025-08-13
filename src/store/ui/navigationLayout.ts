import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, onMounted, ref, shallowRef } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'

type State = {
  navigationWidth: number
}

export const MIN_NAVIGATION_WIDTH = 200
export const DEFAULT_NAVIGATION_WIDTH = 260
export const NAVIGATION_CLOSING_THRESHOLD = MIN_NAVIGATION_WIDTH * 0.4
export const MAX_NAVIGATION_WIDTH_RATIO = 0.5

const useNavigationLayoutStorePinia = defineStore('ui/navigationLayout', () => {
  const initialValue: State = {
    navigationWidth: DEFAULT_NAVIGATION_WIDTH
  }

  const [state, _restoring, restoringPromise] = useIndexedDbValue(
    'store/ui/navigationLayout',
    1,
    {},
    initialValue
  )

  const navigationRef = shallowRef<HTMLDivElement>()
  const navigationLeft = ref(0)

  const updateNavigationLeft = () => {
    navigationLeft.value =
      navigationRef.value?.getBoundingClientRect().left ?? 0
  }

  const navigationWidth = ref(state.navigationWidth)

  const isNavigationClosed = computed(() => {
    return navigationWidth.value === 0
  })

  const saveNavigationWidth = () => {
    state.navigationWidth = navigationWidth.value
  }

  const restoreNavigationWidth = () => {
    navigationWidth.value = state.navigationWidth
  }

  onMounted(() => {
    restoringPromise.value.then(restoreNavigationWidth)
  })

  return {
    navigationRef,
    navigationLeft,
    navigationWidth,
    isNavigationClosed,
    saveNavigationWidth,
    restoreNavigationWidth,
    updateNavigationLeft
  }
})

export const useNavigationLayoutStore = convertToRefsStore(
  useNavigationLayoutStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useNavigationLayoutStorePinia, import.meta.hot)
  )
}
