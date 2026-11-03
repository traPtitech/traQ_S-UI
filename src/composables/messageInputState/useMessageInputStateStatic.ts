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
    const current = getStore(cId) ?? createDefaultValue()
    const state = { text: current.text, attachments: [...current.attachments] }

    const isEmpty = state.text === '' && state.attachments.length === 0

    const clearState = () => {
      const latest = getStore(cId)
      if (!latest) return

      setStore(cId, {
        text: latest.text === state.text ? '' : latest.text,
        attachments: latest.attachments.filter(
          attachment =>
            !state.attachments.some(sent => sent.file === attachment.file)
        )
      })
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
