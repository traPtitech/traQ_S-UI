import { computed, reactive, watch } from 'vue'
import type {
  MessageInputState,
  MessageInputStateKey
} from '/@/store/ui/messageInputStateStore'
import {
  createDefaultValue,
  useMessageInputStateStore
} from '/@/store/ui/messageInputStateStore'

const useMessageInputState = (channelId: MessageInputStateKey) => {
  const { getStore, setStore } = useMessageInputStateStore()

  const state: MessageInputState = reactive(
    getStore(channelId) ?? createDefaultValue()
  )
  watch(
    () => getStore(channelId),
    v => {
      if (v) {
        state.text = v.text
        state.attachments = v.attachments
      } else {
        state.text = ''
        state.attachments = []
      }
    },
    { deep: true }
  )
  watch(
    state,
    v => {
      setStore(channelId, v)
    },
    { deep: true, immediate: true }
  )

  const isTextEmpty = computed(() => state.text === '')
  const isAttachmentEmpty = computed(() => state.attachments.length === 0)
  const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

  return {
    state,
    isTextEmpty,
    isEmpty
  }
}

export default useMessageInputState
