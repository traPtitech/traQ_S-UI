import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import type { ChannelId, MessageId } from '/@/types/entity-ids'
import type { Ref } from 'vue'
import { watch, onMounted, onActivated, ref, computed } from 'vue'
import type { Message } from '@traptitech/traq'
import { wsListener } from '/@/lib/websocket'
import useFetchLimit from '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit'
import { messageMitt, useMessagesStore } from '/@/store/entities/messages'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'

/** 一つのメッセージの最低の高さ (CSSに依存) */
const MESSAGE_HEIGHT = 60

interface GetMessagesParams {
  channelId: string
  limit?: number
  offset?: number
  since?: Date
  until?: Date
  inclusive?: boolean
  order?: 'asc' | 'desc'
}

const useChannelMessageFetcher = (
  scrollerEle: Ref<{ $el: HTMLDivElement } | undefined>,
  props: {
    channelId: ChannelId
    entryMessageId?: MessageId
  }
) => {
  const { extendMessagesMap } = useMessagesStore()
  const { renderMessageContent } = useMessagesView()
  const {
    unreadChannelsMap,
    unreadChannelsMapInitialFetchPromise,
    deleteUnreadChannelWithSend
  } = useSubscriptionStore()
  const { fetchLimit, waitHeightResolved } = useFetchLimit(
    scrollerEle,
    MESSAGE_HEIGHT
  )
  const loadedMessageLatestDate = ref<Date>()
  const loadedMessageOldestDate = ref<Date>()
  const unreadSince = ref()

  const updateDates = (messages: Message[]) => {
    if (messages.length <= 0) return

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const firstMessage = messages[0]!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastMessage = messages[messages.length - 1]!

    const firstMessageDate = new Date(firstMessage.createdAt)
    const lastMessageDate = new Date(lastMessage.createdAt)

    const oldDate =
      firstMessageDate < lastMessageDate ? firstMessageDate : lastMessageDate
    const newDate =
      firstMessageDate < lastMessageDate ? lastMessageDate : firstMessageDate

    if (
      !loadedMessageOldestDate.value ||
      oldDate < loadedMessageOldestDate.value
    ) {
      loadedMessageOldestDate.value = oldDate
    }
    if (
      !loadedMessageLatestDate.value ||
      loadedMessageLatestDate.value < newDate
    ) {
      loadedMessageLatestDate.value = newDate
    }
  }

  const fetchMessagesByChannelId = async (params: GetMessagesParams) => {
    const res = await apis.getMessages(
      params.channelId,
      params.limit,
      params.offset,
      params.since?.toISOString(),
      params.until?.toISOString(),
      params.inclusive,
      params.order
    )
    extendMessagesMap(res.data)
    return {
      messages: res.data,
      hasMore: res.headers['x-traq-more'] === 'true'
    }
  }

  const fetchFormerMessages = async (isReachedEnd: Ref<boolean>) => {
    await waitHeightResolved
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit.value,
      order: 'desc',
      until: loadedMessageOldestDate.value
    })

    if (!hasMore) {
      isReachedEnd.value = true
    }

    updateDates(messages)

    return messages.map(message => message.id)
  }

  const fetchLatterMessages = async (
    isReachedLatest: Ref<boolean>
  ): Promise<ChannelId[]> => {
    await waitHeightResolved
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit.value,
      order: 'asc',
      since: loadedMessageLatestDate.value
    })

    if (!hasMore) {
      isReachedLatest.value = true
    }

    updateDates(messages)

    return messages.map(message => message.id)
  }

  const fetchAroundMessages = async (
    entryMessage: Message,
    isReachedLatest: Ref<boolean>,
    isReachedEnd: Ref<boolean>
  ) => {
    const date = new Date(entryMessage.createdAt)
    loadedMessageLatestDate.value = date
    loadedMessageOldestDate.value = date

    await waitHeightResolved
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
    await waitHeightResolved
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit.value,
      order: 'desc',
      since: loadedMessageLatestDate.value
    })

    if (!hasMore) {
      isReachedLatest.value = true
    }

    updateDates(messages)

    return messages.map(message => message.id)
  }

  const onReachedLatest = async () => {
    // 未読を取得していないと未読を表示できないため
    await unreadChannelsMapInitialFetchPromise.value

    const unreadChannel = unreadChannelsMap.value.get(props.channelId)
    if (unreadChannel) {
      // 未読表示を**追加してから**未読を削除
      // 未読の削除は最新メッセージ読み込み完了時
      unreadSince.value = unreadChannel.since
    }

    // 未読の削除
    await deleteUnreadChannelWithSend(props.channelId)
  }

  const messagesFetcher = useMessageFetcher(
    props,
    computed(() => `ch:${props.channelId}`),
    fetchFormerMessages,
    fetchLatterMessages,
    fetchAroundMessages,
    fetchNewMessages,
    onReachedLatest
  )

  const reset = () => {
    messagesFetcher.reset()
    loadedMessageOldestDate.value = undefined
    loadedMessageLatestDate.value = undefined
    unreadSince.value = undefined
  }

  const init = () => {
    messagesFetcher.init()
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

  useMittListener(messageMitt, 'addMessage', ({ message }) => {
    if (props.channelId !== message.channelId) return
    if (!messagesFetcher.isReachedLatest.value) return

    messagesFetcher.addNewMessage(message.id)
  })
  useMittListener(messageMitt, 'updateMessage', async message => {
    await renderMessageContent(message.id)
  })
  useMittListener(messageMitt, 'deleteMessage', messageId => {
    const index = messagesFetcher.messageIds.value.indexOf(messageId)
    if (index === -1) return
    messagesFetcher.messageIds.value.splice(index, 1)
  })
  useMittListener(wsListener, 'reconnect', () => {
    messagesFetcher.loadNewMessages()
  })

  onActivated(() => {
    messagesFetcher.loadNewMessages()
  })

  return {
    ...messagesFetcher,
    unreadSince
  }
}

export default useChannelMessageFetcher
