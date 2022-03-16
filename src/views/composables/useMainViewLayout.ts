import { computed, watch, Ref } from 'vue'
import useSwipeDetector from '/@/composables/useSwipeDetector'
import useSwipeDrawer from '/@/composables/useSwipeDrawer'
import { useMainViewStore, MainViewComponentState } from '/@/store/ui/mainView'
import { useResponsiveStore } from '/@/store/ui/responsive'

type DrawerType = 'none' | 'nav' | 'sidebar'

const stateMachineDrawerTypeMap: Record<MainViewComponentState, DrawerType> = {
  [MainViewComponentState.Hidden]: 'none',
  [MainViewComponentState.NavShown]: 'nav',
  [MainViewComponentState.NavAppearing]: 'nav',
  [MainViewComponentState.NavAppearingAuto]: 'nav',
  [MainViewComponentState.NavAppearingWaitingTouchEnd]: 'nav',
  [MainViewComponentState.NavDisappearing]: 'nav',
  [MainViewComponentState.NavDisappearingAuto]: 'nav',
  [MainViewComponentState.NavDisappearingWaitingTouchEnd]: 'nav',
  [MainViewComponentState.SidebarShown]: 'sidebar',
  [MainViewComponentState.SidebarAppearing]: 'sidebar',
  [MainViewComponentState.SidebarAppearingAuto]: 'sidebar',
  [MainViewComponentState.SidebarAppearingWaitingTouchEnd]: 'sidebar',
  [MainViewComponentState.SidebarDisappearingAuto]: 'sidebar',
  [MainViewComponentState.SidebarDisappearing]: 'sidebar',
  [MainViewComponentState.SidebarDisappearingWaitingTouchEnd]: 'sidebar'
}

const useMainViewLayout = (navWidth: number, sidebarWidth: number) => {
  const { currentMainViewComponentState: mState } = useMainViewStore()
  const { isMobile } = useResponsiveStore()
  const {
    swipeDetectorState,
    touchmoveHandler,
    touchstartHandler,
    touchendHandler
  } = useSwipeDetector(isMobile)

  const currentActiveDrawer = computed(
    (): DrawerType => stateMachineDrawerTypeMap[mState.value]
  )

  const {
    swipeDrawerState: navDrawerState,
    isAppeared: isNavAppeared,
    isCompletelyAppeared: isNavCompletelyAppeared,
    openDrawer: openNav,
    closeDrawer: closeNav
  } = useSwipeDrawer(
    swipeDetectorState,
    'right',
    navWidth,
    navWidth / 16,
    navWidth / 16,
    computed(() => currentActiveDrawer.value === 'sidebar'),
    isAppearing => {
      mState.value = isAppearing
        ? MainViewComponentState.NavAppearing
        : MainViewComponentState.NavDisappearing
    }
  )

  const {
    swipeDrawerState: sidebarDrawerState,
    isAppeared: isSidebarAppeared,
    isCompletelyAppeared: isSidebarCompletelyAppeared,
    openDrawer: openSidebar,
    closeDrawer: closeSidebar
  } = useSwipeDrawer(
    swipeDetectorState,
    'left',
    sidebarWidth,
    sidebarWidth / 16,
    sidebarWidth / 16,
    computed(() => currentActiveDrawer.value === 'nav'),
    isAppearing => {
      mState.value = isAppearing
        ? MainViewComponentState.SidebarAppearing
        : MainViewComponentState.SidebarDisappearing
    }
  )

  // state machine hooks
  watch(mState, newState => {
    switch (newState) {
      case MainViewComponentState.NavAppearingAuto:
        openNav()
        break
      case MainViewComponentState.NavDisappearingAuto:
        closeNav()
        break
      case MainViewComponentState.SidebarAppearingAuto:
        openSidebar()
        break
      case MainViewComponentState.SidebarDisappearingAuto:
        closeSidebar()
    }
  })

  watch(isMobile, newState => {
    if (newState) {
      mState.value = MainViewComponentState.Hidden
      return
    }
    closeNav()
    closeSidebar()
  })

  // state machine transitions
  const buildStateMachineTransitions = (
    states: {
      shown: MainViewComponentState
      hidden: MainViewComponentState.Hidden
      appearing: MainViewComponentState
      appearingAuto: MainViewComponentState
      appearingWaitingTouchEnd: MainViewComponentState
      disappearing: MainViewComponentState
      disappearingAuto: MainViewComponentState
      disappearingWaitingTouchEnd: MainViewComponentState
    },
    appeared: Readonly<Ref<boolean>>,
    completelyAppeared: Readonly<Ref<boolean>>
  ) => {
    watch(completelyAppeared, newVal => {
      if (
        newVal &&
        (mState.value === states.appearingAuto ||
          mState.value === states.appearing ||
          mState.value === states.disappearing)
      ) {
        mState.value = states.shown
      }
      if (!newVal && mState.value === states.shown) {
        mState.value = states.disappearing
      }
    })
    watch(appeared, newVal => {
      if (newVal && mState.value === states.appearingWaitingTouchEnd) {
        mState.value = states.appearing
      }
      if (newVal && mState.value === states.disappearingWaitingTouchEnd) {
        mState.value = states.disappearing
      }
      if (!newVal && mState.value === states.disappearingAuto) {
        mState.value = states.hidden
      }
      if (!newVal && mState.value === states.appearing) {
        if (swipeDetectorState.swipeDirection === 'none') {
          mState.value = states.hidden
        } else {
          mState.value = states.appearingWaitingTouchEnd
        }
      }
      if (!newVal && mState.value === states.disappearing) {
        if (swipeDetectorState.swipeDirection === 'none') {
          mState.value = states.hidden
        } else {
          mState.value = states.disappearingWaitingTouchEnd
        }
      }
    })
    watch(
      () => swipeDetectorState.swipeDirection,
      newVal => {
        if (newVal !== 'none') return
        if (
          mState.value === states.appearingWaitingTouchEnd ||
          mState.value === states.disappearingWaitingTouchEnd
        ) {
          mState.value = states.hidden
        }
      }
    )
  }

  buildStateMachineTransitions(
    {
      shown: MainViewComponentState.NavShown,
      hidden: MainViewComponentState.Hidden,
      appearing: MainViewComponentState.NavAppearing,
      appearingAuto: MainViewComponentState.NavAppearingAuto,
      appearingWaitingTouchEnd:
        MainViewComponentState.NavAppearingWaitingTouchEnd,
      disappearing: MainViewComponentState.NavDisappearing,
      disappearingAuto: MainViewComponentState.NavDisappearingAuto,
      disappearingWaitingTouchEnd:
        MainViewComponentState.NavDisappearingWaitingTouchEnd
    },
    isNavAppeared,
    isNavCompletelyAppeared
  )
  buildStateMachineTransitions(
    {
      shown: MainViewComponentState.SidebarShown,
      hidden: MainViewComponentState.Hidden,
      appearing: MainViewComponentState.SidebarAppearing,
      appearingAuto: MainViewComponentState.SidebarAppearingAuto,
      appearingWaitingTouchEnd:
        MainViewComponentState.SidebarAppearingWaitingTouchEnd,
      disappearing: MainViewComponentState.SidebarDisappearing,
      disappearingAuto: MainViewComponentState.SidebarDisappearingAuto,
      disappearingWaitingTouchEnd:
        MainViewComponentState.SidebarDisappearingWaitingTouchEnd
    },
    isSidebarAppeared,
    isSidebarCompletelyAppeared
  )

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
    isSidebarCompletelyAppeared,
    isMainViewActive,
    openSidebar,
    closeSidebar,
    openNav,
    closeNav,
    currentActiveDrawer
  }
}

export default useMainViewLayout
