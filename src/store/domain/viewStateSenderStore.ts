import { ref } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

/**
 * /@/views/composables/useViewStateSenderで利用する情報を格納することを想定
 */
const useViewStateSenderStorePinia = defineStore(
  'domain/viewStateSenderStore',
  () => {
    /**
     * 最新のメッセージを受け取る必要があるかどうか
     *
     * 最新側に未取得区間がなく、新着を表示に取り込める状態と同期する必要がある
     */
    const shouldReceiveLatestMessages = ref(false)
    /** タイピング中かどうか */
    const isTyping = ref(false)

    return { shouldReceiveLatestMessages, isTyping }
  }
)

export const useViewStateSenderStore = convertToRefsStore(
  useViewStateSenderStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useViewStateSenderStorePinia, import.meta.hot)
  )
}
