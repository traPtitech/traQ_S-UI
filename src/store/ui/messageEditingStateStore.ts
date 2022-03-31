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

    // 遷移時に編集中状態を消す
    // これは編集中状態が保持されていても、編集内容は保持されなく、わかりにくいため
    watch(
      () => route.path,
      () => {
        editingMessageId.value = undefined
      }
    )

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
