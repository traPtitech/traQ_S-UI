import { computed, watch, Ref } from 'vue'
import store from '/@/vuex'
import useSwipeDetector from '/@/use/swipeDetector'
import useSwipeDrawer from '/@/use/swipeDrawer'
import { MainViewComponentState } from '/@/vuex/ui/mainView/state'
import useIsMobile from '/@/use/isMobile'

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
  const { isMobile } = useIsMobile()
  const {
    swipeDetectorState,
    touchmoveHandler,
    touchstartHandler,
    touchendHandler
  } = useSwipeDetector(isMobile)

  const mState = computed(
    () => store.state.ui.mainView.currentMainViewComponentState
  )
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
    isAppearing =>
      store.commit.ui.mainView.setMainViewComponentState(
        isAppearing
          ? MainViewComponentState.NavAppearing
          : MainViewComponentState.NavDisappearing
      )
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
    isAppearing =>
      store.commit.ui.mainView.setMainViewComponentState(
        isAppearing
          ? MainViewComponentState.SidebarAppearing
          : MainViewComponentState.SidebarDisappearing
      )
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
      store.commit.ui.mainView.setMainViewComponentState(
        MainViewComponentState.Hidden
      )
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
        store.commit.ui.mainView.setMainViewComponentState(states.shown)
      }
      if (!newVal && mState.value === states.shown) {
        store.commit.ui.mainView.setMainViewComponentState(states.disappearing)
      }
    })
    watch(appeared, newVal => {
      if (newVal && mState.value === states.appearingWaitingTouchEnd) {
        store.commit.ui.mainView.setMainViewComponentState(states.appearing)
      }
      if (newVal && mState.value === states.disappearingWaitingTouchEnd) {
        store.commit.ui.mainView.setMainViewComponentState(states.disappearing)
      }
      if (!newVal && mState.value === states.disappearingAuto) {
        store.commit.ui.mainView.setMainViewComponentState(states.hidden)
      }
      if (!newVal && mState.value === states.appearing) {
        if (swipeDetectorState.swipeDirection === 'none') {
          store.commit.ui.mainView.setMainViewComponentState(states.hidden)
        } else {
          store.commit.ui.mainView.setMainViewComponentState(
            states.appearingWaitingTouchEnd
          )
        }
      }
      if (!newVal && mState.value === states.disappearing) {
        if (swipeDetectorState.swipeDirection === 'none') {
          store.commit.ui.mainView.setMainViewComponentState(states.hidden)
        } else {
          store.commit.ui.mainView.setMainViewComponentState(
            states.disappearingWaitingTouchEnd
          )
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
          store.commit.ui.mainView.setMainViewComponentState(states.hidden)
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
