import { computed } from '@vue/composition-api'
import store from '@/store'
import { MainViewComponentState } from '@/store/ui/mainView/state'

const useSidebar = () => {
  const state = computed(
    () => store.state.ui.mainView.currentMainViewComponentState
  )

  /** サイドバーが開ききっているか */
  const isSidebarOpen = computed(() => store.getters.ui.mainView.isSidebarOpen)

  /** サイドバーが表示されている必要があるか */
  const shouldShowSidebar = computed(
    () =>
      state.value === MainViewComponentState.SidebarShown ||
      (store.getters.ui.isMobile &&
        (state.value === MainViewComponentState.SidebarAppearing ||
          state.value === MainViewComponentState.SidebarAppearingAuto ||
          state.value === MainViewComponentState.SidebarDisappearing ||
          state.value === MainViewComponentState.SidebarDisappearingAuto))
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
