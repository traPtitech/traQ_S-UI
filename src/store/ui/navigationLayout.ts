import { onMounted, ref, shallowRef, toRef, watch } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

type State = {
  navigationWidth: number
  isNavigationClosed: boolean
}

export const MIN_NAVIGATION_WIDTH = 200
export const DEFAULT_NAVIGATION_WIDTH = 260
export const NAVIGATION_CLOSING_THRESHOLD = MIN_NAVIGATION_WIDTH * 0.4
export const MAX_NAVIGATION_WIDTH_RATIO = 0.5

const useNavigationLayoutStorePinia = defineStore('ui/navigationLayout', () => {
  const initialValue: State = {
    navigationWidth: DEFAULT_NAVIGATION_WIDTH,
    isNavigationClosed: false
  }

  const [state, _restoring, restoringPromise] = useIndexedDbValue(
    'store/ui/navigationLayout',
    1,
    {},
    initialValue
  )

  const navigationRef = shallowRef<HTMLDivElement>()
  const resizerRef = shallowRef<HTMLDivElement>()

  const navigationLeft = ref(0)

  const updateNavigationLeft = () => {
    navigationLeft.value =
      navigationRef.value?.getBoundingClientRect().left ?? 0
  }

  const navigationWidth = ref(0)

  watch(navigationWidth, width => {
    state.isNavigationClosed = width === 0
  })

  const saveNavigationWidth = () => {
    state.navigationWidth = navigationWidth.value
  }

  const closeNavigation = () => {
    navigationWidth.value = 0
  }

  const restoreNavigationWidth = () => {
    if (navigationWidth.value > 0) return
    navigationWidth.value = state.navigationWidth
  }

  const initializeNavigationWidth = () => {
    navigationWidth.value = DEFAULT_NAVIGATION_WIDTH
    saveNavigationWidth()
  }

  onMounted(async () => {
    await restoringPromise.value

    if (state.isNavigationClosed) return
    restoreNavigationWidth()
  })

  return {
    navigationRef,
    resizerRef,
    navigationLeft,
    navigationWidth,
    isNavigationClosed: toRef(state, 'isNavigationClosed'),
    saveNavigationWidth,
    restoreNavigationWidth,
    initializeNavigationWidth,
    closeNavigation,
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
