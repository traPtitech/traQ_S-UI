import { computed, ref } from 'vue'
import store from '/@/store'
import useSidebar from '/@/use/sidebar'

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

  const pinnedMessages = computed(
    () => store.state.domain.messagesView.pinnedMessages
  )
  const viewerIds = computed(
    () => store.getters.domain.messagesView.viewingUsers
  )
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
