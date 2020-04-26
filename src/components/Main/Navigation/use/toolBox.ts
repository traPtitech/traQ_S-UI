import store from '@/store'
import { computed } from '@vue/composition-api'
import usePopupMenu from '../../MainView/ChannelView/use/popupMenu'

const useToolBox = () => {
  const { isPopupMenuShown, closePopupMenu, togglePopupMenu } = usePopupMenu()

  const themeIcon = computed(() => {
    const { type } = store.state.app.themeSettings
    switch (type) {
      case 'light':
        return 'crescent-outline'
      case 'dark':
        return 'crescent'
      case 'custom':
        return 'brightness-6'
      default:
        const invalid: never = type
        // eslint-disable-next-line no-console
        console.warn(`Invalid theme type: ${invalid}`)

        return 'crescent'
    }
  })
  const isMdi = computed(() => {
    return store.state.app.themeSettings.type === 'custom' ? true : undefined
  })

  const isThemeClickDisabled = computed(
    () => store.state.app.themeSettings.type === 'custom'
  )

  const toggleTheme = () => store.dispatch.app.themeSettings.toggleTheme()
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
      // theme
      {
        iconName: themeIcon.value,
        iconMdi: isMdi.value,
        disabled: isThemeClickDisabled.value,
        onClick: toggleTheme
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
