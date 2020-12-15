import { computed, reactive } from 'vue'
import store from '@/_store'
import useSidebar from '@/use/sidebar'

const useChannelSidebarCommon = () => {
  const state = reactive({
    pinnedMode: false,
    pinnedMessages: computed(
      () => store.state.domain.messagesView.pinnedMessages
    )
  })
  const viewerIds = computed(
    () => store.getters.domain.messagesView.viewingUsers
  )
  const togglePinnedMode = () => {
    state.pinnedMode = !state.pinnedMode
  }
  const { openSidebar, closeSidebar } = useSidebar()
  return { state, viewerIds, togglePinnedMode, openSidebar, closeSidebar }
}

export default useChannelSidebarCommon
