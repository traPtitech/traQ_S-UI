import store from '/@/vuex'
import { useMainViewStore, MainViewComponentState } from '/@/store/ui/mainView'

/**
 * モバイル用にナビゲーションの開閉を行う
 */
const useNavigation = () => {
  const { currentMainViewComponentState, isNavOpen, isNoComponentOpen } =
    useMainViewStore()

  const openNav = () => {
    if (!store.state.ui.isMobile || !isNoComponentOpen.value) {
      return
    }
    currentMainViewComponentState.value =
      MainViewComponentState.NavAppearingAuto
  }
  const closeNav = () => {
    if (!store.state.ui.isMobile || !isNavOpen.value) {
      return
    }
    currentMainViewComponentState.value =
      MainViewComponentState.NavDisappearingAuto
  }
  return { openNav, closeNav }
}

export default useNavigation
