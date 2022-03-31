import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import { MessageId } from '/@/types/entity-ids'

const useMessageEditingStateStorePinia = defineStore(
  'ui/messageEditingStateStore',
  () => {
    const route = useRoute()

    const editingMessageId = ref<MessageId>()

    return { editingMessageId }
  }
)

export const useMessageEditingStateStore = convertToRefsStore(
  useMessageEditingStateStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMessageEditingStateStorePinia, import.meta.hot)
  )
}
