import { computed, ref } from 'vue'
import store from '@/store'
import useSidebar from '@/use/sidebar'

type ChannelSidebarPage = ChannelSidebarDefaultPage | ChannelSidebarPinnedPage

type ChannelSidebarDefaultPage = {
  type: 'default'
}
type ChannelSidebarPinnedPage = {
  type: 'pinned'
}

const useChannelSidebarCommon = () => {
  const page = ref<ChannelSidebarPage>({ type: 'default' })
  const moveToDefaultPage = () => {
    page.value = { type: 'default' }
  }
  const moveToPinnedPage = () => {
    page.value = { type: 'pinned' }
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
    pinnedMessages,
    viewerIds,
    openSidebar,
    closeSidebar
  }
}

export default useChannelSidebarCommon
