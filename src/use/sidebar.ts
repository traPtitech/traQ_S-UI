import { computed } from '@vue/composition-api'
import store from '@/store'
import { MainViewComponentState } from '@/store/ui/mainView/state'

const useSidebar = () => {
  const state = computed(
    () => store.state.ui.mainView.currentMainViewComponentState
  )
  const isSidebarOpen = computed(() => store.getters.ui.mainView.isSidebarOpen)
  const shouldShowSidebar = computed(
    () =>
      store.getters.ui.isMobile &&
      (state.value === MainViewComponentState.SidebarShown ||
        state.value === MainViewComponentState.SidebarAppearing ||
        state.value === MainViewComponentState.SidebarAppearingAuto ||
        state.value === MainViewComponentState.SidebarDisappearing ||
        state.value === MainViewComponentState.SidebarDisappearingAuto)
  )
  const openSidebar = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.SidebarShown
    )
  }
  const closeSidebar = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.Hidden
    )
  }
  return { isSidebarOpen, shouldShowSidebar, openSidebar, closeSidebar }
}

export default useSidebar
