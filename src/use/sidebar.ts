import { computed } from '@vue/composition-api'
import store from '@/store'
import { MainViewComponentState } from '@/store/ui/mainView/state'

const useSidebar = () => {
  const isSidebarOpen = computed(() => store.state.ui.mainView.isSidebarOpen)
  const openSidebar = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.SidebarAppearingAuto
    )
  }
  const closeSidebar = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.SidebarDisappearingAuto
    )
  }
  return { isSidebarOpen, openSidebar, closeSidebar }
}

export default useSidebar
