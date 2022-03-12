import { useMainViewStore, MainViewComponentState } from '/@/store/ui/mainView'
import { useResponsiveStore } from '/@/store/ui/responsive'

/**
 * モバイル用にナビゲーションの開閉を行う
 */
const useNavigation = () => {
  const { isMobile } = useResponsiveStore()
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

export default useNavigation
