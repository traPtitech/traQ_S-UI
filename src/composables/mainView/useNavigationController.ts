import useResponsive from '/@/composables/useResponsive'
import { MainViewComponentState, useMainViewStore } from '/@/store/ui/mainView'

/**
 * モバイル用にナビゲーションの開閉を行う
 */
const useNavigationController = () => {
  const { isMobile } = useResponsive()
  const { currentMainViewComponentState, isNavOpen, isNoComponentOpen } =
    useMainViewStore()

  const openNav = () => {
    if (!isMobile.value || !isNoComponentOpen.value) {
      return
    }
    currentMainViewComponentState.value =
      MainViewComponentState.NavAppearingAuto
  }
  const closeNav = () => {
    if (!isMobile.value || !isNavOpen.value) {
      return
    }
    currentMainViewComponentState.value =
      MainViewComponentState.NavDisappearingAuto
  }
  return { openNav, closeNav }
}

export default useNavigationController
