import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/use/messagesFetcher'
import store from '/@/vuex'
import { ChannelId, MessageId } from '/@/types/entity-ids'
import { Ref, watch, onMounted, onBeforeUnmount, onActivated, ref } from 'vue'
import { Message } from '@traptitech/traq'
import { wsListener } from '/@/lib/websocket'
import useFetchLimit from '/@/components/Main/MainView/MessagesScroller/use/fetchLimit'
import { messageMitt } from '/@/vuex/entities/messages'
import { unreadChannelsMapInitialFetchPromise } from '/@/vuex/domain/me/promises'
import { useMessagesView } from '/@/store/domain/messagesView'

/** 一つのメッセージの最低の高さ (CSSに依存) */
const MESSAGE_HEIGHT = 60

const useChannelMessageFetcher = (
  scrollerEle: Ref<{ $el: HTMLDivElement } | undefined>,
  props: {
    channelId: ChannelId
    entryMessageId?: MessageId
  }
) => {
  const { fetchMessagesByChannelId, syncViewState } = useMessagesView()
  const { fetchLimit, waitMounted } = useFetchLimit(scrollerEle, MESSAGE_HEIGHT)
  const loadedMessageLatestDate = ref<Date>()
  const loadedMessageOldestDate = ref<Date>()
  const unreadSince = ref()

  const fetchFormerMessages = async (isReachedEnd: Ref<boolean>) => {
    await waitMounted
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit.value,
      order: 'desc',
      until: loadedMessageOldestDate.value
    })

    if (!hasMore) {
      isReachedEnd.value = true
    }

    const oldestMessage = messages[messages.length - 1]
    if (oldestMessage) {
      const oldestMessageDate = new Date(oldestMessage.createdAt)
      if (
        !loadedMessageOldestDate.value ||
        oldestMessageDate < loadedMessageOldestDate.value
      ) {
        loadedMessageOldestDate.value = oldestMessageDate
      }
    }

    return messages.map(message => message.id)
  }

  const fetchLatterMessages = async (
    isReachedLatest: Ref<boolean>
  ): Promise<ChannelId[]> => {
    await waitMounted
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit.value,
      order: 'asc',
      since: loadedMessageLatestDate.value
    })

    if (!hasMore) {
      isReachedLatest.value = true
    }

    const latestMessage = messages[messages.length - 1]
    if (latestMessage) {
      const latestMessageDate = new Date(latestMessage.createdAt)
      if (
        !loadedMessageLatestDate.value ||
        latestMessageDate > loadedMessageLatestDate.value
      ) {
        loadedMessageLatestDate.value = latestMessageDate
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
    loadedMessageLatestDate.value = date
    loadedMessageOldestDate.value = date

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
    const { messages, hasMore } = await fetchMessagesByChannelId({
      channelId: props.channelId,
      limit: fetchLimit.value,
      order: 'desc',
      since: loadedMessageLatestDate.value
    })

    if (!hasMore) {
      isReachedLatest.value = true
    }

    const oldestMessage = messages[messages.length - 1]
    if (oldestMessage) {
      const oldestMessageDate = new Date(oldestMessage.createdAt)
      if (
        !loadedMessageOldestDate.value ||
        oldestMessageDate < loadedMessageOldestDate.value
      ) {
        loadedMessageOldestDate.value = oldestMessageDate
      }
    }

    return messages.map(message => message.id)
  }

  const onReachedLatest = async () => {
    // 未読を取得していないと未読を表示できないため
    await unreadChannelsMapInitialFetchPromise

    const unreadChannel = store.state.domain.me.unreadChannelsMap.get(
      props.channelId
    )
    if (unreadChannel) {
      // 未読表示を**追加してから**未読を削除
      // 未読の削除は最新メッセージ読み込み完了時
      unreadSince.value = unreadChannel.since
    }

    // 未読の削除
    await store.dispatch.domain.me.deleteUnreadChannelWithSend(props.channelId)
  }

  const messagesFetcher = useMessageFetcher(
    props,
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
    syncViewState()
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

  const onReconnect = () => {
    messagesFetcher.loadNewMessages()
  }
  const onAdded = ({ message }: { message: Message }) => {
    if (props.channelId !== message.channelId) return
    if (!messagesFetcher.isReachedLatest.value) return

    messagesFetcher.addNewMessage(message.id)
  }
  const onDeleted = (messageId: MessageId) => {
    const index = messagesFetcher.messageIds.value.indexOf(messageId)
    if (index === -1) return
    messagesFetcher.messageIds.value.splice(index, 1)
  }
  onMounted(() => {
    wsListener.on('reconnect', onReconnect)
    messageMitt.on('addMessage', onAdded)
    messageMitt.on('deleteMessage', onDeleted)
  })
  onBeforeUnmount(() => {
    wsListener.off('reconnect', onReconnect)
    messageMitt.off('addMessage', onAdded)
    messageMitt.off('deleteMessage', onDeleted)
  })
  onActivated(() => {
    messagesFetcher.loadNewMessages()

    // 設定画面から戻ってきたときの場合があるので同じチャンネルでも送りなおす
    syncViewState()
  })

  return {
    ...messagesFetcher,
    unreadSince
  }
}

export default useChannelMessageFetcher
