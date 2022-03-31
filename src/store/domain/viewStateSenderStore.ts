import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
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
     * messageFetcherの`isReachedLatest`と同期する必要がある
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
