import useMessageFetcher from '@/components/Main/MainView/MessagesScroller/use/messagesFetcher'
import store from '@/store'
import { MessageId, ClipFolderId } from '@/types/entity-ids'
import { reactive, Ref, watch, onMounted } from 'vue'

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
    } = await store.dispatch.entities.fetchMessagesInClipFolder({
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
    undefined
  )

  onMounted(() => {
    reset()
    messagesFetcher.init()
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

  return messagesFetcher
}

export default useClipsFetcher
