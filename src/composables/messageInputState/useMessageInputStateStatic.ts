import { unref } from 'vue'
import type { MessageInputStateKey } from '/@/store/ui/messageInputStateStore'
import {
  createDefaultValue,
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

    const isEmpty = state.text === '' && state.attachments.length === 0

    const clearState = () => {
      state.text = ''
      state.attachments = []
      setStore(cId, state)
    }

    return {
      state,
      isEmpty,
      clearState
    }
  }

  return { getMessageInputState }
}

export default useMessageInputStateStatic
