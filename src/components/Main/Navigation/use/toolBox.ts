import store from '@/store'
import { computed } from '@vue/composition-api'
import usePopupMenu from '../../MainView/ChannelView/use/popupMenu'

const useToolBox = () => {
  const { isPopupMenuShown, closePopupMenu, togglePopupMenu } = usePopupMenu()

  const openQrCodeModal = () =>
    store.dispatch.ui.modal.pushModal({ type: 'qrcode' })
  const openSettingsModal = () =>
    store.dispatch.ui.modal.pushModal({ type: 'setting' })

  const tools = computed(
    (): Array<{
      iconName: string
      iconMdi?: true
      disabled?: boolean
      onClick: () => void
    }> => [
      // Apps
      {
        iconName: 'apps',
        iconMdi: true,
        onClick: togglePopupMenu
      },
      // qr
      {
        iconName: 'qrcode',
        iconMdi: true,
        onClick: openQrCodeModal
      },
      // settings
      {
        iconName: 'cog',
        iconMdi: true,
        onClick: openSettingsModal
      }
    ]
  )

  return {
    isServicesShown: isPopupMenuShown,
    closeServices: closePopupMenu,
    toggleServices: togglePopupMenu,
    tools
  }
}

export default useToolBox
