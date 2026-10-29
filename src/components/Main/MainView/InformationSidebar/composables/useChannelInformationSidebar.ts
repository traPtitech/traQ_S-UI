import { ref, watch } from 'vue'

import useSidebar from '/@/composables/mainView/useSidebar'
import { useBrowserSettings } from '/@/store/app/browserSettings'

type ChannelInformationSidebarPage = 'default' | 'pinned' | 'events'

const useChannelInformationSidebar = () => {
  const { lastOpenChannelId } = useBrowserSettings()

  const page = ref<ChannelInformationSidebarPage>('default')
  const moveToDefaultPage = () => {
    page.value = 'default'
  }
  const moveToPinnedPage = () => {
    page.value = 'pinned'
  }
  const moveToEventsPage = () => {
    page.value = 'events'
  }

  const { openSidebar, closeSidebar } = useSidebar()

  watch(lastOpenChannelId, () => {
    moveToDefaultPage()
  })

  return {
    page,
    moveToDefaultPage,
    moveToPinnedPage,
    moveToEventsPage,
    openSidebar,
    closeSidebar
  }
}

export default useChannelInformationSidebar
