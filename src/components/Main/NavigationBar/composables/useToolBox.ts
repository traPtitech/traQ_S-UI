import { computed } from 'vue'
import usePopupMenu from '../../MainView/ChannelView/composables/usePopupMenu'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useOpenLink } from '/@/composables/useOpenLink'
import { useModalStore } from '/@/store/ui/modal'

interface Tool {
  iconName: string
  iconMdi: boolean
  /**
   * clickイベントと中央クリックでのmousedownイベントで呼ばれる
   */
  onClick: (event: MouseEvent) => void
}

const useToolBox = () => {
  const { isPopupMenuShown, closePopupMenu, togglePopupMenu } = usePopupMenu()
  const { openLink } = useOpenLink()
  const { pushModal } = useModalStore()

  const { openCommandPalette } = useCommandPalette()
  const openQrCodeModal = () => pushModal({ type: 'qrcode' })
  const openSettings = (e: MouseEvent) => {
    openLink(e, '/settings')
  }

  const tools = computed(() => {
    const tools: Tool[] = []
    if (window.traQConfig.enableSearch) {
      tools.push({
        iconName: 'search',
        iconMdi: true,
        onClick: () => openCommandPalette('search')
      })
    }
    if (window.traQConfig.services && window.traQConfig.services.length > 0) {
      tools.push({
        iconName: 'apps',
        iconMdi: true,
        onClick: togglePopupMenu
      })
    }
    if (window.traQConfig.showQrCodeButton) {
      tools.push({
        iconName: 'qrcode',
        iconMdi: true,
        onClick: openQrCodeModal
      })
    }
    tools.push({
      iconName: 'cog',
      iconMdi: true,
      onClick: openSettings
    })
    return tools
  })

  return {
    isServicesShown: isPopupMenuShown,
    closeServices: closePopupMenu,
    toggleServices: togglePopupMenu,
    tools
  }
}

export default useToolBox
