import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/use/messagesFetcher'
import store from '/@/store'
import { ChannelId, MessageId } from '/@/types/entity-ids'
import {
  reactive,
  Ref,
  watch,
  onMounted,
  onBeforeUnmount,
  onActivated,
  computed
} from 'vue'
import { Message } from '@traptitech/traq'
import { wsListener } from '/@/lib/websocket'
import useFetchLimit from '/@/components/Main/MainView/MessagesScroller/use/fetchLimit'

/** 一つのメッセージの最低の高さ (CSSに依存) */
const MESSAGE_HEIGHT = 60

type State = {
  loadedMessageLatestDate: Date | undefined
  loadedMessageOldestDate: Date | undefined
}

const useChannelMessageFetcher = (
  scrollerEle: Ref<{ $el: HTMLDivElement } | undefined>,
  props: {
    channelId: ChannelId
    entryMessageId?: MessageId
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReachedLatest = () => {}
) => {
  const { fetchLimit, waitMounted } = useFetchLimit(scrollerEle, MESSAGE_HEIGHT)
  const state: State = reactive({
    loadedMessageLatestDate: undefined,
    loadedMessageOldestDate: undefined
  })

  const fetchFormerMessages = async (isReachedEnd: Ref<boolean>) => {
    await waitMounted
    const { messages, hasMore } =
      await store.dispatch.domain.messagesView.fetchMessagesByChannelId({
        channelId: props.channelId,
        limit: fetchLimit.value,
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
    await waitMounted
    const { messages, hasMore } =
      await store.dispatch.domain.messagesView.fetchMessagesByChannelId({
        channelId: props.channelId,
        limit: fetchLimit.value,
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

    const latestMessage = messages[messages.length - 1] as Message | undefined
    if (latestMessage) {
      const latestMessageDate = new Date(latestMessage.createdAt)
      if (
        !state.loadedMessageLatestDate ||
        latestMessageDate > state.loadedMessageLatestDate
      ) {
        state.loadedMessageLatestDate = latestMessageDate
      }
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

    await waitMounted
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
    await waitMounted
    const { messages, hasMore } =
      await store.dispatch.domain.messagesView.fetchMessagesByChannelId({
        channelId: props.channelId,
        limit: fetchLimit.value,
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

  const reset = () => {
    messagesFetcher.reset()
    state.loadedMessageOldestDate = undefined
    state.loadedMessageLatestDate = undefined
  }

  const init = () => {
    messagesFetcher.init()
    store.dispatch.domain.messagesView.syncViewState()
  }

  onMounted(() => {
    reset()
    init()
  })
  watch(
    () => props.entryMessageId,
    (newVal, oldVal) => {
      if (newVal === oldVal) {
        return
      }
      reset()
      init()
    }
  )
  watch(
    () => props.channelId,
    (newVal, oldVal) => {
      if (newVal === oldVal) {
        return
      }
      reset()
      init()
    }
  )
  watch(
    // syncViewStateがshouldRetriveMessageCreateEventを利用してるので
    // isReachedLatestだとタイミングがずれて正しい値がセットされない
    computed(
      () => store.state.domain.messagesView.shouldRetriveMessageCreateEvent
    ),
    () => {
      store.dispatch.domain.messagesView.syncViewState()
    }
  )

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
