import { reactive, computed, watchEffect } from '@vue/composition-api'
import useSwipeDetector from '@/use/swipeDetector'
import useSwipeDrawer from '@/use/swipeDrawer'

const useMainViewLayout = (navWidth: number, sidebarWidth: number) => {
  const {
    swipeDetectorState,
    touchmoveHandler,
    touchstartHandler,
    touchendHandler
  } = useSwipeDetector()

  const state = reactive({
    currentActiveDrawer: 'none' as 'none' | 'nav' | 'sidebar'
  })

  const {
    swipeDrawerState: navDrawerState,
    isAppeared: isNavAppeared,
    isCompletelyAppeared: isNavCompletelyAppeared
  } = useSwipeDrawer(
    swipeDetectorState,
    'right',
    navWidth,
    navWidth / 16,
    navWidth / 16,
    computed(
      () =>
        state.currentActiveDrawer !== 'none' &&
        state.currentActiveDrawer !== 'nav'
    )
  )

  const {
    swipeDrawerState: sidebarDrawerState,
    isAppeared: isSidebarAppeared,
    isCompletelyAppeared: isSidebarCompletelyAppeared
  } = useSwipeDrawer(
    swipeDetectorState,
    'left',
    sidebarWidth,
    sidebarWidth / 16,
    sidebarWidth / 16,
    computed(
      () =>
        state.currentActiveDrawer !== 'none' &&
        state.currentActiveDrawer !== 'sidebar'
    )
  )

  watchEffect(() => {
    if (isNavAppeared.value) {
      state.currentActiveDrawer = 'nav'
    } else if (isSidebarAppeared.value) {
      state.currentActiveDrawer = 'sidebar'
    } else {
      state.currentActiveDrawer = 'none'
    }
  })

  const isMainViewActive = computed(
    () => !isNavCompletelyAppeared.value && !isSidebarCompletelyAppeared.value
  )

  const mainViewPosition = computed(() => {
    return navDrawerState.currentPosition
  })
  const sidebarPosition = computed(() => {
    return -sidebarDrawerState.currentPosition
  })

  return {
    touchmoveHandler,
    touchstartHandler,
    touchendHandler,
    mainViewPosition,
    sidebarPosition,
    isNavAppeared,
    isNavCompletelyAppeared,
    isSidebarAppeared,
    isMainViewActive
  }
}

export default useMainViewLayout
