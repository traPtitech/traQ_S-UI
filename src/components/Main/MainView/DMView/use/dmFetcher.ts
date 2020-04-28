import useMessageFetcher from '@/components/Main/MainView/MessagesScroller/use/messagesFetcher'
import store from '@/store'
import { MessageId, UserId } from '@/types/entity-ids'
import { reactive, Ref, watch } from '@vue/composition-api'

const fetchLimit = 50

const useDMFetcher = (props: {
  userId: UserId
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
      messages,
      hasMore
    } = await store.dispatch.entities.fetchDirectMessagesByUserId({
      userId: props.userId,
      limit: fetchLimit,
      offset: state.nextLoadOffset
    })

    if (!hasMore) {
      isReachedEnd.value = true
    } else {
      state.nextLoadOffset += fetchLimit
    }

    return messages.map(message => message.id)
  }

  const messagesFetcher = useMessageFetcher(
    {},
    fetchFormerMessages,
    undefined,
    undefined
  )

  watch(
    () => props.userId,
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

export default useDMFetcher
