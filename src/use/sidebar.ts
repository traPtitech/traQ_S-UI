import { computed } from 'vue'
import store from '/@/store'
import { MainViewComponentState } from '/@/store/ui/mainView/state'

const useSidebar = () => {
  const state = computed(
    () => store.state.ui.mainView.currentMainViewComponentState
  )

  /** サイドバーが開ききっているか */
  const isSidebarOpen = computed(() => store.getters.ui.mainView.isSidebarOpen)

  /**
   * サイドバーが表示されている必要があるか
   *
   * モバイルの場合は引き出し開始時点で表示する必要があるため特殊な扱いとなる
   */
  const shouldShowSidebar = computed(
    () =>
      state.value === MainViewComponentState.SidebarShown ||
      (store.state.ui.isMobile &&
        (state.value === MainViewComponentState.SidebarAppearing ||
          state.value === MainViewComponentState.SidebarAppearingAuto ||
          state.value === MainViewComponentState.SidebarDisappearing ||
          state.value === MainViewComponentState.SidebarDisappearingAuto))
  )
  const openSidebar = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      store.state.ui.isMobile
        ? MainViewComponentState.SidebarAppearingAuto
        : MainViewComponentState.SidebarShown
    )
  }
  const closeSidebar = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      store.state.ui.isMobile
        ? MainViewComponentState.SidebarDisappearingAuto
        : MainViewComponentState.Hidden
    )
  }
  return { isSidebarOpen, shouldShowSidebar, openSidebar, closeSidebar }
}

export default useSidebar
