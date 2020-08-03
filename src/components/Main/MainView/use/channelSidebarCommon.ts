import { computed, reactive } from 'vue'
import store from '@/store'
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
  const { closeSidebar } = useSidebar()
  return { state, viewerIds, togglePinnedMode, closeSidebar }
}

export default useChannelSidebarCommon
