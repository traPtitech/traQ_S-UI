import { computed } from 'vue'
import store from '/@/vuex'
import { useMainViewStore, MainViewComponentState } from '/@/store/ui/mainView'
import { useResponsiveStore } from '/@/store/ui/responsive'

const useSidebar = () => {
  const { currentMainViewComponentState: state, isSidebarOpen } =
    useMainViewStore()
  const { isMobile } = useResponsiveStore()

  /**
   * サイドバーが表示されている必要があるか
   *
   * モバイルの場合は引き出し開始時点で表示する必要があるため特殊な扱いとなる
   */
  const shouldShowSidebar = computed(
    () =>
      state.value === MainViewComponentState.SidebarShown ||
      (isMobile.value &&
        (state.value === MainViewComponentState.SidebarAppearing ||
          state.value === MainViewComponentState.SidebarAppearingAuto ||
          state.value === MainViewComponentState.SidebarDisappearing ||
          state.value === MainViewComponentState.SidebarDisappearingAuto))
  )
  const openSidebar = () => {
    state.value = isMobile.value
      ? MainViewComponentState.SidebarAppearingAuto
      : MainViewComponentState.SidebarShown
  }
  const closeSidebar = () => {
    state.value = isMobile.value
      ? MainViewComponentState.SidebarDisappearingAuto
      : MainViewComponentState.Hidden
  }
  return { isSidebarOpen, shouldShowSidebar, openSidebar, closeSidebar }
}

export default useSidebar
