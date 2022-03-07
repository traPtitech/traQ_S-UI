import store from '/@/vuex'
import { MainViewComponentState } from '/@/vuex/ui/mainView/state'

/**
 * モバイル用にナビゲーションの開閉を行う
 */
const useNavigation = () => {
  const openNav = () => {
    if (
      !store.state.ui.isMobile ||
      !store.getters.ui.mainView.isNoComponentOpen
    ) {
      return
    }
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.NavAppearingAuto
    )
  }
  const closeNav = () => {
    if (!store.state.ui.isMobile || !store.getters.ui.mainView.isNavOpen) {
      return
    }
    store.commit.ui.mainView.setMainViewComponentState(
      MainViewComponentState.NavDisappearingAuto
    )
  }
  return { openNav, closeNav }
}

export default useNavigation
