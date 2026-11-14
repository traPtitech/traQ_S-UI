import type { Message } from '@traptitech/traq'

import { computed, onActivated, onMounted, ref, watch } from 'vue'

import useFetchLimit, {
  type MessageScrollerRef
} from '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit'
import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { messageMitt } from '/@/store/entities/messages'
import type { ChannelId, MessageId } from '/@/types/entity-ids'

/** 一つのメッセージの最低の高さ (CSSに依存) */
const MESSAGE_HEIGHT = 60

interface GetMessagesParams {
  channelId: string
  since?: Date
  until?: Date
  order: 'asc' | 'desc'
}

const useChannelMessageFetcher = (
  scrollerRef: MessageScrollerRef,
  props: {
    channelId: ChannelId
    entryMessageId?: MessageId
  }
) => {
  const { renderMessageContent } = useMessagesView()
  const {
    unreadChannelsMap,
    unreadChannelsMapInitialFetchPromise,
    deleteUnreadChannelWithSend
  } = useSubscriptionStore()
  const getFetchLimit = useFetchLimit(scrollerRef, MESSAGE_HEIGHT)
  const loadedMessageLatestDate = ref<Date>()
  const loadedMessageOldestDate = ref<Date>()
  const unreadSince = ref()

  const applyPagination = ({ messages }: { messages: Message[] }) => {
    const first = messages.at(0)
    const last = messages.at(-1)
    if (!first || !last) return

    const oldestDate = new Date(first.createdAt)
    const latestDate = new Date(last.createdAt)

    if (
      !loadedMessageOldestDate.value ||
      oldestDate < loadedMessageOldestDate.value
    ) {
      loadedMessageOldestDate.value = oldestDate
    }

    if (
      !loadedMessageLatestDate.value ||
      loadedMessageLatestDate.value < latestDate
    ) {
      loadedMessageLatestDate.value = latestDate
    }
  }

  const fetchMessagesByChannelId = async (params: GetMessagesParams) => {
    const limit = await getFetchLimit()
    const { data, headers } = await apis.getMessages(
      params.channelId,
      limit,
      undefined,
      params.since?.toISOString(),
      params.until?.toISOString(),
      undefined,
      params.order
    )

    return {
      messages: params.order === 'asc' ? data : data.toReversed(),
      hasMore: headers['x-traq-more'] === 'true'
    }
  }

  const fetchFormerMessages = async () => {
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      order: 'desc',
      until: loadedMessageOldestDate.value
    })

    return { messages, isReachedEnd: !hasMore }
  }

  const fetchLaterMessages = async (order: 'asc' | 'desc') => {
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      order,
      since: loadedMessageLatestDate.value
    })

    return { messages, isReachedLatest: !hasMore }
  }

  const fetchAroundMessages = async (entryMessage: Message) => {
    const { channelId } = props
    const date = new Date(entryMessage.createdAt)
    const [former, latter] = await Promise.all([
      fetchMessagesByChannelId({ channelId, order: 'desc', until: date }),
      fetchMessagesByChannelId({ channelId, order: 'asc', since: date })
    ])

    return {
      messages: [...former.messages, entryMessage, ...latter.messages],
      isReachedEnd: !former.hasMore,
      isReachedLatest: !latter.hasMore
    }
  }

  const onReachedLatest = async (isCurrentView: () => boolean) => {
    const { channelId } = props

    // 未読を取得していないと未読を表示できないため
    await unreadChannelsMapInitialFetchPromise
    if (!isCurrentView()) return

    const unreadChannel = unreadChannelsMap.value.get(channelId)
    if (unreadChannel) {
      // 未読表示を**追加してから**未読を削除
      // 未読の削除は最新メッセージ読み込み完了時
      unreadSince.value = unreadChannel.since
    }

    // 未読の削除
    await deleteUnreadChannelWithSend(channelId)
  }

  const messagesFetcher = useMessageFetcher(
    props,
    computed(() => `ch:${props.channelId}`),
    {
      fetchFormerMessages,
      fetchLatterMessages: () => fetchLaterMessages('asc'),
      fetchAroundMessages,
      fetchNewMessages: () => fetchLaterMessages('desc'),
      applyPagination,
      onReachedLatest
    }
  )

  const initialize = () => {
    messagesFetcher.reset()
    loadedMessageOldestDate.value = undefined
    loadedMessageLatestDate.value = undefined
    unreadSince.value = undefined
    return messagesFetcher.init()
  }

  onMounted(initialize)
  watch([() => props.channelId, () => props.entryMessageId], initialize)

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
