import type { Message } from '@traptitech/traq'

import type { ShallowRef } from 'vue'
import { onActivated, ref } from 'vue'

import useFetchLimit from '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit'
import useMessageFetcher, {
  type MessagePage,
  type MessagePageContext
} from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import type { MessageScrollerInstance } from '/@/components/Main/MainView/MessagesScroller/types'
import type { IsCurrentAsyncScope } from '/@/composables/utils/useAsyncScope'
import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'
import { compareDateString } from '/@/lib/basic/date'
import { wsListener } from '/@/lib/websocket'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { messageMitt } from '/@/store/entities/messages'
import type { ChannelId, MessageId } from '/@/types/entity-ids'

const MESSAGE_HEIGHT = 60

interface DateRange {
  oldest?: Date
  latest?: Date
}

type Context = MessagePageContext<ChannelId, DateRange>

const extendRange = (range: DateRange, messages: Message[]): DateRange => {
  const first = messages[0]
  const last = messages.at(-1)

  if (!first || !last) return range

  const oldest = new Date(first.createdAt)
  const latest = new Date(last.createdAt)

  return {
    oldest: !range.oldest || oldest < range.oldest ? oldest : range.oldest,
    latest: !range.latest || range.latest < latest ? latest : range.latest
  }
}

const useChannelMessageFetcher = (
  scrollerRef: ShallowRef<MessageScrollerInstance | undefined>,
  props: { channelId: ChannelId; entryMessageId?: MessageId }
) => {
  const { renderMessageContent } = useMessagesView()

  const {
    unreadChannelsMap,
    unreadChannelsMapInitialFetchPromise,
    deleteUnreadChannelWithSend
  } = useSubscriptionStore()

  const { fetchLimit, waitHeightResolved } = useFetchLimit(
    scrollerRef,
    MESSAGE_HEIGHT
  )

  const unreadSince = ref<string>()

  const fetchPage = async (
    context: Context,
    query: { order: 'asc' | 'desc'; since?: Date; until?: Date },
    end: 'reachedStart' | 'reachedEnd'
  ): Promise<MessagePage<DateRange>> => {
    const { data, headers } = await apis.getMessages(
      context.source,
      context.limit,
      undefined,
      query.since?.toISOString(),
      query.until?.toISOString(),
      undefined,
      query.order,
      { signal: context.signal }
    )

    const messages = query.order === 'desc' ? data.toReversed() : data

    return {
      messages,
      cursor: extendRange(context.cursor, messages),
      [end]: headers['x-traq-more'] !== 'true'
    }
  }

  const older = (context: Context) =>
    fetchPage(
      context,
      { order: 'desc', until: context.cursor.oldest },
      'reachedStart'
    )

  const newer = (context: Context) =>
    fetchPage(
      context,
      { order: 'asc', since: context.cursor.latest },
      'reachedEnd'
    )

  const messagesFetcher = useMessageFetcher({
    source: () => props.channelId,
    entryMessageId: () => props.entryMessageId,
    initialCursor: (): DateRange => ({}),

    ready: waitHeightResolved,
    limit: fetchLimit,
    receiveNewMessages: 'latest',
    compareMessages: (a, b) => compareDateString(a.createdAt, b.createdAt),

    onReset: () => {
      unreadSince.value = undefined
    },

    onReachedLatest: async (isCurrent: IsCurrentAsyncScope) => {
      await unreadChannelsMapInitialFetchPromise
      if (!isCurrent()) return

      const unreadChannel = unreadChannelsMap.value.get(props.channelId)
      if (unreadChannel) unreadSince.value = unreadChannel.since

      await deleteUnreadChannelWithSend(props.channelId)
    },

    load: {
      older,
      newer,
      catchUp: newer,

      around: async ({ entryMessage, ...context }) => {
        const date = new Date(entryMessage.createdAt)
        const anchor = { ...context, cursor: { oldest: date, latest: date } }

        const [before, after] = await Promise.all([
          older(anchor),
          newer(anchor)
        ])

        return {
          messages: [...before.messages, entryMessage, ...after.messages],
          cursor: { oldest: before.cursor.oldest, latest: after.cursor.latest },
          reachedStart: before.reachedStart,
          reachedEnd: after.reachedEnd
        }
      }
    }
  })

  const reportError = (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  const catchUpMessages = () => {
    void messagesFetcher.requestCatchUp().catch(reportError)
  }

  useMittListener(messageMitt, 'addMessage', ({ message }) => {
    if (props.channelId !== message.channelId) return

    void messagesFetcher.addNewMessage(message.id).catch(reportError)
  })

  useMittListener(messageMitt, 'updateMessage', message =>
    renderMessageContent(message.id).catch(reportError)
  )

  useMittListener(messageMitt, 'deleteMessage', messagesFetcher.removeMessage)
  useMittListener(wsListener, 'reconnect', catchUpMessages)

  onActivated(catchUpMessages)

  return { ...messagesFetcher, unreadSince }
}

export default useChannelMessageFetcher
