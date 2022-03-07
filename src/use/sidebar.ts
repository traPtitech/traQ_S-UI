import { computed } from 'vue'
import store from '/@/vuex'
import { useMainViewStore, MainViewComponentState } from '/@/store/ui/mainView'

const useSidebar = () => {
  const { currentMainViewComponentState: state, isSidebarOpen } =
    useMainViewStore()

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
    state.value = store.state.ui.isMobile
      ? MainViewComponentState.SidebarAppearingAuto
      : MainViewComponentState.SidebarShown
  }
  const closeSidebar = () => {
    state.value = store.state.ui.isMobile
      ? MainViewComponentState.SidebarDisappearingAuto
      : MainViewComponentState.Hidden
  }
  return { isSidebarOpen, shouldShowSidebar, openSidebar, closeSidebar }
}

export default useSidebar
