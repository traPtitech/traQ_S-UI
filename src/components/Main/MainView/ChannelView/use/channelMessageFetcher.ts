import useMessageFetcher from '@/components/Main/MainView/MessagesScroller/use/messagesFetcher'
import store from '@/store'
import { ChannelId, MessageId } from '@/types/entity-ids'
import {
  reactive,
  Ref,
  watch,
  onMounted,
  onBeforeUnmount,
  onActivated
} from 'vue'
import { Message } from '@traptitech/traq'
import { wsListener } from '@/lib/websocket'

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
      store.dispatch.domain.messagesView.setShouldRetriveMessageCreateEvent(
        true
      )
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

  const fetchNewMessages = async (isReachedLatest: Ref<boolean>) => {
    const {
      messages,
      hasMore
    } = await store.dispatch.domain.messagesView.fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit,
      order: 'desc',
      since: state.loadedMessageLatestDate
    })

    if (!hasMore) {
      isReachedLatest.value = true
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

  const messagesFetcher = useMessageFetcher(
    props,
    fetchFormerMessages,
    fetchLatterMessages,
    fetchAroundMessages,
    fetchNewMessages
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

      store.dispatch.domain.messagesView.syncViewState()
    }
  )
  watch(messagesFetcher.isReachedLatest, () => {
    store.dispatch.domain.messagesView.syncViewState()
  })

  const onReconnect = () => {
    messagesFetcher.loadNewMessages()
  }
  onMounted(() => {
    wsListener.on('reconnect', onReconnect)
  })
  onBeforeUnmount(() => {
    wsListener.off('reconnect', onReconnect)
  })
  onActivated(() => {
    messagesFetcher.loadNewMessages()

    // 設定画面から戻ってきたときの場合があるので同じチャンネルでも送りなおす
    store.dispatch.domain.messagesView.syncViewState()
  })

  return messagesFetcher
}

export default useChannelMessageFetcher
