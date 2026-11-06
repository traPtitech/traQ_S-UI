import { computed, reactive } from 'vue'

import type { MessageInputStateKey } from '/@/store/ui/messageInputStateStore'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

const useMessageInputState = (draftKey: MessageInputStateKey) => {
  const { getDraft, updateDraft, getDocumentKey } = useMessageInputStateStore()

  const state = reactive({
    text: computed({
      get: () => getDraft(draftKey)?.text ?? '',
      set: text =>
        updateDraft(draftKey, draft => {
          draft.text = text
        })
    }),
    attachments: computed(() => getDraft(draftKey)?.attachments ?? [])
  })

  const documentKey = computed(() => getDocumentKey(draftKey))

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
