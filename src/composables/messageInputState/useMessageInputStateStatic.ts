import { computed, unref } from 'vue'
import {
  createDefaultValue,
  MessageInputStateKey,
  useMessageInputStateStore
} from '/@/store/ui/messageInputStateStore'

const useMessageInputStateStatic = () => {
  const { getStore, setStore } = useMessageInputStateStore()

  /**
   * リアクティブでない値を返す(channelIdや入力状態が変化しても返り値が変化しない)
   */
  const getMessageInputState = (channelId: MessageInputStateKey) => {
    const cId = unref(channelId)
    const state = getStore(cId) ?? createDefaultValue()

    const isTextEmpty = computed(() => state.text === '')
    const isAttachmentEmpty = computed(() => state.attachments.length === 0)
    const isEmpty = computed(() => isTextEmpty.value && isAttachmentEmpty.value)

    const clearState = () => {
      state.text = ''
      state.attachments = []
      setStore(cId, state)
    }

    return {
      state,
      isTextEmpty,
      isAttachmentEmpty,
      isEmpty,
      clearState
    }
  }

  return { getMessageInputState }
}

export default useMessageInputStateStatic
