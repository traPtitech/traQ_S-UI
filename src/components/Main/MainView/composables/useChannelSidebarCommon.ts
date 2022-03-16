import { ref } from 'vue'
import useSidebar from '/@/composables/useSidebar'
import { useMessagesView } from '/@/store/domain/messagesView'

type ChannelSidebarPage = 'default' | 'pinned' | 'events'

const useChannelSidebarCommon = () => {
  const { pinnedMessages, viewingUsers: viewerIds } = useMessagesView()

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
    pinnedMessages,
    viewerIds,
    openSidebar,
    closeSidebar
  }
}

export default useChannelSidebarCommon
