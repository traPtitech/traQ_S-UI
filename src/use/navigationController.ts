import store from '@/_store'
import { MainViewComponentState } from '@/_store/ui/mainView/state'

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
