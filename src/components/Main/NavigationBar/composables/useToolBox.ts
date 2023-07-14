import { computed } from 'vue'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useOpenLink } from '/@/composables/useOpenLink'
import { useModalStore } from '/@/store/ui/modal'
import useToggle from '/@/composables/utils/useToggle'

interface Tool {
  toolName: string
  iconName: string
  iconMdi: boolean
  /**
   * clickイベントと中央クリックでのmousedownイベントで呼ばれる
   */
  onClick: (event: MouseEvent) => void
}

const useToolBox = () => {
  const {
    value: isServicesShown,
    close: closeServices,
    toggle: toggleServices
  } = useToggle(false)
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
        toolName: '検索',
        iconName: 'search',
        iconMdi: true,
        onClick: () => openCommandPalette('search')
      })
    }
    if (window.traQConfig.services && window.traQConfig.services.length > 0) {
      tools.push({
        toolName: 'サービス',
        iconName: 'apps',
        iconMdi: true,
        onClick: toggleServices
      })
    }
    if (window.traQConfig.showQrCodeButton) {
      tools.push({
        toolName: 'QRコード',
        iconName: 'qrcode',
        iconMdi: true,
        onClick: openQrCodeModal
      })
    }
    tools.push({
      toolName: '設定',
      iconName: 'cog',
      iconMdi: true,
      onClick: openSettings
    })
    return tools
  })

  return {
    isServicesShown,
    closeServices,
    toggleServices,
    tools
  }
}

export default useToolBox
