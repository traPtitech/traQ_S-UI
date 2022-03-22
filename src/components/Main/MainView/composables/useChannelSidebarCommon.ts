import { ref } from 'vue'
import useSidebar from '/@/composables/mainView/useSidebar'

type ChannelSidebarPage = 'default' | 'pinned' | 'events'

const useChannelSidebarCommon = () => {
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
