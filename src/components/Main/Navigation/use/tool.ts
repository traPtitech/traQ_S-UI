import store from '@/store'

export const toggleNotification = () => {
  return
}
export const toggleTheme = () => store.dispatch.app.themeSettings.toggleTheme()

export const openSettingsModal = () =>
  store.dispatch.ui.modal.pushModal({ type: 'setting' })
