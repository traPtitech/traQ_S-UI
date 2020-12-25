import useMessageFetcher from '@/components/Main/MainView/MessagesScroller/use/messagesFetcher'
import store from '@/store'
import { ChannelId, MessageId } from '@/types/entity-ids'
import { reactive, Ref, watch, onMounted } from 'vue'
import { Message } from '@traptitech/traq'

const fetchLimit = 20

type State = {
  loadedMessageLatestDate: Date | undefined
  loadedMessageOldestDate: Date | undefined
}

const useChannelMessageFetcher = (
  props: {
    channelId: ChannelId
    entryMessageId?: MessageId
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReachedLatest = () => {}
) => {
  const state: State = reactive({
    loadedMessageLatestDate: undefined,
    loadedMessageOldestDate: undefined
  })

  const reset = () => {
    state.loadedMessageOldestDate = undefined
    state.loadedMessageLatestDate = undefined
  }

  const fetchFormerMessages = async (isReachedEnd: Ref<boolean>) => {
    const {
      messages,
      hasMore
    } = await store.dispatch.domain.messagesView.fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit,
      order: 'desc',
      until: state.loadedMessageOldestDate
    })

    if (!hasMore) {
      isReachedEnd.value = true
    }

    const oldestMessage = messages[messages.length - 1] as Message | undefined
    if (oldestMessage) {
      const oldestMessageDate = new Date(oldestMessage.createdAt)
      if (
        !state.loadedMessageOldestDate ||
        oldestMessageDate < state.loadedMessageOldestDate
      ) {
        state.loadedMessageOldestDate = oldestMessageDate
      }
    }

    return messages.map(message => message.id)
  }

  const fetchLatterMessages = async (
    isReachedLatest: Ref<boolean>
  ): Promise<ChannelId[]> => {
    const {
      messages,
      hasMore
    } = await store.dispatch.domain.messagesView.fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit,
      order: 'asc',
      since: state.loadedMessageLatestDate
    })

    if (!hasMore) {
      isReachedLatest.value = true
      store.commit.domain.messagesView.setShouldRetriveMessageCreateEvent(true)
      onReachedLatest()
    }

    const latestMessage = messages[messages.length - 1]
    const latestMessageDate = new Date(latestMessage.createdAt)
    if (
      !state.loadedMessageLatestDate ||
      latestMessageDate > state.loadedMessageLatestDate
    ) {
      state.loadedMessageLatestDate = latestMessageDate
    }

    return messages.map(message => message.id)
  }

  const fetchAroundMessages = async (
    entryMessage: Message,
    isReachedLatest: Ref<boolean>,
    isReachedEnd: Ref<boolean>
  ) => {
    const date = new Date(entryMessage.createdAt)
    state.loadedMessageLatestDate = date
    state.loadedMessageOldestDate = date

    const [formerMessageIds, latterMessageIds] = await Promise.all([
      fetchFormerMessages(isReachedEnd),
      fetchLatterMessages(isReachedLatest)
    ])
    return [
      ...new Set([
        ...formerMessageIds.reverse(),
        entryMessage.id,
        ...latterMessageIds
      ])
    ]
  }

  const messagesFetcher = useMessageFetcher(
    props,
    fetchFormerMessages,
    fetchLatterMessages,
    fetchAroundMessages
  )

  onMounted(() => {
    reset()
    messagesFetcher.init()
  })
  watch(
    () => props.entryMessageId,
    (newVal, oldVal) => {
      if (newVal === oldVal) {
        return
      }
      reset()
      messagesFetcher.init()
    }
  )
  watch(
    () => props.channelId,
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

export default useChannelMessageFetcher
