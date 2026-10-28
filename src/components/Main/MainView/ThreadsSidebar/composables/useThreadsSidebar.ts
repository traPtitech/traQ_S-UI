import { ref, watch } from 'vue'

import useSidebar from '/@/composables/mainView/useSidebar'
import { useBrowserSettings } from '/@/store/app/browserSettings'

type ChannelThreadsSidebarPage = 'default' | 'notification'

const useChannelThreadsSidebar = () => {
  const { lastOpenChannelId } = useBrowserSettings()

  const page = ref<ChannelThreadsSidebarPage>('default')
  const moveToDefaultPage = () => {
    page.value = 'default'
  }
  const moveToNotificationPage = () => {
    page.value = 'notification'
  }

  const { openSidebar, closeSidebar } = useSidebar()

  watch(lastOpenChannelId, () => {
    moveToDefaultPage()
  })

  return {
    page,
    moveToDefaultPage,
    moveToNotificationPage,
    openSidebar,
    closeSidebar
  }
}

export default useChannelThreadsSidebar
