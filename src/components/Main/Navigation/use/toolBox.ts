import store from '@/store'
import { computed } from '@vue/composition-api'
import usePopupMenu from '../../MainView/ChannelView/use/popupMenu'
import config from '@/config'

interface Tool {
  iconName: string
  iconMdi?: true
  disabled?: boolean
  onClick: () => void
}

const useToolBox = () => {
  const { isPopupMenuShown, closePopupMenu, togglePopupMenu } = usePopupMenu()

  const openQrCodeModal = () =>
    store.dispatch.ui.modal.pushModal({ type: 'qrcode' })
  const openSettingsModal = () =>
    store.dispatch.ui.modal.pushModal({ type: 'setting' })

  const tools = computed(() => {
    const tools: Tool[] = []
    tools.push({
      iconName: 'apps',
      iconMdi: true,
      onClick: togglePopupMenu
    })
    if (config.showQrCodeButton) {
      tools.push({
        iconName: 'qrcode',
        iconMdi: true,
        onClick: openQrCodeModal
      })
    }
    tools.push({
      iconName: 'cog',
      iconMdi: true,
      onClick: openSettingsModal
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
