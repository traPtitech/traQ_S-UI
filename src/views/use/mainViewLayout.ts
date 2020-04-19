import { computed, watch } from '@vue/composition-api'
import store from '@/store'
import useSwipeDetector from '@/use/swipeDetector'
import useSwipeDrawer from '@/use/swipeDrawer'
import { MainViewComponentState } from '@/store/ui/mainView/state'

type DrawerType = 'none' | 'nav' | 'sidebar'

const stateMachineDrawerTypeMap: Record<MainViewComponentState, DrawerType> = {
  [MainViewComponentState.Hidden]: 'none',
  [MainViewComponentState.NavShown]: 'nav',
  [MainViewComponentState.NavAppearing]: 'nav',
  [MainViewComponentState.NavAppearingAuto]: 'nav',
  [MainViewComponentState.NavDisappearing]: 'nav',
  [MainViewComponentState.NavDisappearingAuto]: 'nav',
  [MainViewComponentState.SidebarShown]: 'sidebar',
  [MainViewComponentState.SidebarAppearing]: 'sidebar',
  [MainViewComponentState.SidebarAppearingAuto]: 'sidebar',
  [MainViewComponentState.SidebarDisappearingAuto]: 'sidebar',
  [MainViewComponentState.SidebarDisappearing]: 'sidebar'
}

const useMainViewLayout = (navWidth: number, sidebarWidth: number) => {
  const {
    swipeDetectorState,
    touchmoveHandler,
    touchstartHandler,
    touchendHandler
  } = useSwipeDetector()

  const componentStateMachine = computed(
    () => store.state.ui.mainView.currentMainViewComponentState
  )
  const currentActiveDrawer = computed(
    (): DrawerType => stateMachineDrawerTypeMap[componentStateMachine.value]
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
  watch(componentStateMachine, (newState, oldState) => {
    if (!store.getters.ui.isMobile) return
    if (newState === MainViewComponentState.SidebarAppearingAuto) {
      openSidebar()
    } else if (newState === MainViewComponentState.SidebarDisappearingAuto) {
      closeSidebar()
    }
  })
  // state machine transitions
  // TODO: まとめる
  watch(isNavCompletelyAppeared, newVal => {
    if (!store.getters.ui.isMobile || !newVal) return
    if (
      componentStateMachine.value === MainViewComponentState.NavAppearingAuto ||
      componentStateMachine.value === MainViewComponentState.NavAppearing
    ) {
      store.commit.ui.mainView.setMainViewComponentState(
        MainViewComponentState.NavShown
      )
    }
  })
  watch(isNavAppeared, newVal => {
    if (!store.getters.ui.isMobile || newVal) return
    if (
      componentStateMachine.value ===
        MainViewComponentState.NavDisappearingAuto ||
      componentStateMachine.value === MainViewComponentState.NavDisappearing
    ) {
      store.commit.ui.mainView.setMainViewComponentState(
        MainViewComponentState.Hidden
      )
    }
  })
  watch(isSidebarCompletelyAppeared, newVal => {
    if (!store.getters.ui.isMobile || !newVal) return
    if (
      componentStateMachine.value ===
        MainViewComponentState.SidebarAppearingAuto ||
      componentStateMachine.value === MainViewComponentState.SidebarAppearing
    ) {
      store.commit.ui.mainView.setMainViewComponentState(
        MainViewComponentState.SidebarShown
      )
    }
  })
  watch(isSidebarAppeared, newVal => {
    if (!store.getters.ui.isMobile || newVal) return
    if (
      componentStateMachine.value ===
        MainViewComponentState.SidebarDisappearingAuto ||
      componentStateMachine.value === MainViewComponentState.SidebarDisappearing
    ) {
      store.commit.ui.mainView.setMainViewComponentState(
        MainViewComponentState.Hidden
      )
    }
  })
  watch(
    computed(() => store.getters.ui.isMobile),
    isMobile => {
      if (!isMobile) {
        closeSidebar()
      } else {
        store.commit.ui.mainView.setMainViewComponentState(
          MainViewComponentState.Hidden
        )
      }
    }
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
