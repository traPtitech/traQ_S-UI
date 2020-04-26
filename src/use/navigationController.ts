import store from '@/store'
import { MainViewComponentState } from '@/store/ui/mainView/state'

const useNavigation = () => {
  const openNav = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      store.getters.ui.isMobile
        ? MainViewComponentState.NavAppearingAuto
        : MainViewComponentState.NavShown
    )
  }
  const closeNav = () => {
    store.commit.ui.mainView.setMainViewComponentState(
      store.getters.ui.isMobile
        ? MainViewComponentState.NavDisappearingAuto
        : MainViewComponentState.Hidden
    )
  }
  return { openNav, closeNav }
}

export default useNavigation
