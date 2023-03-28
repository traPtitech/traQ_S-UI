import { ref, watch } from 'vue'
import useSidebar from '/@/composables/mainView/useSidebar'
import { useBrowserSettings } from '/@/store/app/browserSettings'

type ChannelSidebarPage = 'default' | 'pinned' | 'events'

const useChannelSidebarCommon = () => {
  const { lastOpenChannelName } = useBrowserSettings()

  const page = ref<ChannelSidebarPage>('default')
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

  watch(lastOpenChannelName, () => {
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

export default useChannelSidebarCommon
