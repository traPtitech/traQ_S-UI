import useMessageFetcher from '@/components/Main/MainView/MessagesScroller/use/messagesFetcher'
import store from '@/store'
import { MessageId, ClipFolderId } from '@/types/entity-ids'
import { reactive, Ref, watch, onMounted, onActivated } from 'vue'

const fetchLimit = 50

const useClipsFetcher = (props: {
  clipFolderId: ClipFolderId
  entryMessageId?: MessageId
}) => {
  const state = reactive({
    nextLoadOffset: 0
  })

  const reset = () => {
    state.nextLoadOffset = 0
  }

  const fetchFormerMessages = async (isReachedEnd: Ref<boolean>) => {
    const {
      clips,
      hasMore
    } = await store.dispatch.domain.messagesView.fetchMessagesInClipFolder({
      folderId: props.clipFolderId,
      limit: fetchLimit,
      offset: state.nextLoadOffset
    })

    if (!hasMore) {
      isReachedEnd.value = true
    } else {
      state.nextLoadOffset += fetchLimit
    }

    return clips.map(clip => clip.message.id)
  }

  const messagesFetcher = useMessageFetcher(
    {},
    fetchFormerMessages,
    undefined,
    undefined,
    undefined
  )

  onMounted(() => {
    reset()
    messagesFetcher.init()

    store.dispatch.domain.messagesView.syncViewState()
  })
  watch(
    () => props.clipFolderId,
    (newVal, oldVal) => {
      if (newVal === oldVal) {
        return
      }
      reset()
      messagesFetcher.init()
    }
  )

  onActivated(() => {
    // 一応送りなおす
    store.dispatch.domain.messagesView.syncViewState()
  })

  // クリップフォルダは、wsの再接続時にうまく取得ができないので、
  // 自動で再取得するのはあきらめる

  return messagesFetcher
}

export default useClipsFetcher
