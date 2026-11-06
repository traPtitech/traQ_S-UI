import { computed, reactive } from 'vue'

import type { MessageInputStateKey } from '/@/store/ui/messageInputStateStore'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

const useMessageInputState = (channelId: MessageInputStateKey) => {
  const { getStore, updateDraft, getDocumentKey } = useMessageInputStateStore()

  const state = reactive({
    text: computed({
      get: () => getStore(channelId)?.text ?? '',
      set: text =>
        updateDraft(channelId, draft => {
          draft.text = text
        })
    }),
    attachments: computed(() => getStore(channelId)?.attachments ?? [])
  })

  const documentKey = computed(() => getDocumentKey(channelId))

  const isTextEmpty = computed(() => state.text === '')
  const isAttachmentEmpty = computed(() => state.attachments.length === 0)
  const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

  return {
    state,
    isTextEmpty,
    isEmpty,
    documentKey
  }
}

export default useMessageInputState
