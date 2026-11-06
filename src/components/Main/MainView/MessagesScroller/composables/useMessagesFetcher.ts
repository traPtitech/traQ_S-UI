import type { Message } from '@traptitech/traq'

import type { MaybeRefOrGetter, WatchSource } from 'vue'
import { computed, shallowRef, toValue, watchEffect } from 'vue'

import { until } from '@vueuse/core'

import type { IsCurrentAsyncScope } from '/@/composables/utils/useAsyncScope'
import usePagedList, {
  type PageContext
} from '/@/composables/utils/usePagedList'
import apis from '/@/lib/apis'
import { createOrderedTask } from '/@/lib/basic/async'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'
import { useMessagesStore } from '/@/store/entities/messages'
import type { CacheMessages } from '/@/store/entities/messages'
import type { MessageId } from '/@/types/entity-ids'
import type { MaybePromise } from '/@/types/utility'

export interface MessagePage<Cursor> {
  messages: Message[]
  cursor: Cursor
  reachedStart?: boolean
  reachedEnd?: boolean
}

export interface MessagePageContext<Source, Cursor> extends PageContext<
  Source,
  Cursor
> {
  limit: number
}

interface AroundContext<Source, Cursor> extends MessagePageContext<
  Source,
  Cursor
> {
  entryMessage: Message
}

type MessageLoader<Source, Cursor> = (
  context: MessagePageContext<Source, Cursor>
) => Promise<MessagePage<Cursor>>

interface MessageFetcherOptions<Source, Cursor> {
  source: WatchSource<Source>
  entryMessageId?: WatchSource<MessageId | undefined>
  initialCursor: () => Cursor
  ready?: Promise<void>
  limit: MaybeRefOrGetter<number>
  autoLoad?: boolean
  receiveNewMessages?: 'latest' | 'always'
  compareMessages?: (a: Message, b: Message) => number
  resolveMessage?: (messageId: MessageId) => Promise<Message>
  onReset?: () => void
  onReachedLatest?: (isCurrent: IsCurrentAsyncScope) => MaybePromise<void>

  load: {
    older: MessageLoader<Source, Cursor>
    newer?: MessageLoader<Source, Cursor>
    latest?: MessageLoader<Source, Cursor>
    catchUp?: MessageLoader<Source, Cursor>

    around?: (
      context: AroundContext<Source, Cursor>
    ) => Promise<MessagePage<Cursor>>
  }
}

const useMessageFetcher = <Source, Cursor>(
  options: MessageFetcherOptions<Source, Cursor>
) => {
  const { renderMessageContent, resetRenderedContent } = useMessagesView()
  const { shouldReceiveLatestMessages } = useViewStateSenderStore()
  const { withMessageUpdates, isMessageDeleted, messagesMap } =
    useMessagesStore()
  const removals = shallowRef(new Map<MessageId, symbol>())
  let addInOrder = createOrderedTask()

  const resolveMessage =
    options.resolveMessage ??
    (async (messageId: MessageId) =>
      messagesMap.value.get(messageId) ??
      (await apis.getMessage(messageId)).data)

  const source = computed(() => ({
    value: toValue(options.source),

    entryMessageId: options.entryMessageId
      ? toValue(options.entryMessageId)
      : undefined
  }))

  type SourceSnapshot = typeof source.value
  type Context = PageContext<SourceSnapshot, Cursor>

  const preparePage =
    (
      loader: (
        context: Context,
        cacheMessages: CacheMessages
      ) => Promise<MessagePage<Cursor>>
    ) =>
    async (context: Context) =>
      withMessageUpdates(async cacheMessages => {
        const page = await loader(context, cacheMessages)
        // 描画処理が参照する共有キャッシュを先に更新する。
        const messages = cacheMessages(page.messages)

        await Promise.all(
          messages.map(message =>
            renderMessageContent(message.id, () => !context.signal.aborted)
          )
        )

        // 描画待ちの間に届いた更新・削除を、一覧への反映直前にも再適用する。
        return { ...page, items: cacheMessages(messages) }
      }, context.signal)

  const adapt = (loader: MessageLoader<Source, Cursor>) =>
    preparePage(context =>
      loader({
        ...context,
        source: context.source.value,
        limit: toValue(options.limit)
      })
    )

  const around = options.load.around

  const pages = usePagedList<Message, Cursor, SourceSnapshot>({
    source,
    initialCursor: options.initialCursor,

    initialLoadKind: snapshot =>
      snapshot.entryMessageId && around ? 'around' : 'latest',

    ready: options.ready,
    autoLoad: options.autoLoad,
    key: message => message.id,

    load: {
      previous: adapt(options.load.older),
      next: options.load.newer && adapt(options.load.newer),
      latest: options.load.latest && adapt(options.load.latest),
      catchUp: options.load.catchUp && adapt(options.load.catchUp),

      around:
        around &&
        preparePage(async (context, cacheMessages) => {
          const messageId = context.source.entryMessageId

          if (!messageId) throw new Error('Missing entry message')

          const entryMessage = await resolveMessage(messageId)
          cacheMessages([entryMessage])

          const page = await around({
            ...context,
            source: context.source.value,
            entryMessage,
            limit: toValue(options.limit)
          })

          return page
        })
    },

    onReset: () => {
      removals.value = new Map()
      addInOrder = createOrderedTask()
      resetRenderedContent()
      options.onReset?.()
    }
  })

  const messageIds = computed(() => {
    const messages = pages.items.value.filter(
      message =>
        !isMessageDeleted(message.id) && !removals.value.has(message.id)
    )

    if (options.compareMessages) messages.sort(options.compareMessages)

    return messages.map(message => message.id)
  })

  const addNewMessage = (messageId: MessageId) => {
    const isCurrent = pages.capture()
    const removal = removals.value.get(messageId)

    if (options.receiveNewMessages === 'latest') {
      if (!pages.reachedEnd.value && !pages.isLoading.value)
        return Promise.resolve()
    }

    return withMessageUpdates(async cacheMessages => {
      const prepare = async () => {
        if (
          options.receiveNewMessages === 'latest' &&
          pages.needsCatchUp.value
        ) {
          await pages.requestCatchUp()
          if (!isCurrent()) return
        }

        const message = await resolveMessage(messageId)
        if (!isCurrent() || removals.value.get(messageId) !== removal) return

        const [current] = cacheMessages([message])
        if (!current) return

        await renderMessageContent(messageId, isCurrent)

        return current
      }

      const append = async (current: Message | undefined) => {
        if (!current || !isCurrent()) return

        await until(pages.isLoading).toBe(false, { flush: 'post' })

        if (
          !isCurrent() ||
          removals.value.get(messageId) !== removal ||
          messageIds.value.includes(messageId)
        )
          return

        if (options.receiveNewMessages === 'latest' && !pages.isCaughtUp.value)
          return

        const [latest] = cacheMessages([current])
        if (!latest) return

        pages.updateItems(items => [
          ...items.filter(message => message.id !== messageId),
          latest
        ])

        if (removal !== undefined) {
          const remaining = new Map(removals.value)
          remaining.delete(messageId)
          removals.value = remaining
        }
      }

      // 日時などで整列できる一覧では、準備済みの新着を先に表示できる。
      if (options.compareMessages) return append(await prepare())

      return addInOrder(prepare, append)
    }, pages.getSignal())
  }

  const removeMessage = (messageId: MessageId) => {
    removals.value = new Map([...removals.value, [messageId, Symbol()]])
    pages.updateItems(items =>
      items.filter(message => message.id !== messageId)
    )
  }

  watchEffect(async () => {
    const isCurrent = pages.capture()
    const isStillLatest = () =>
      isCurrent() &&
      pages.isCaughtUp.value &&
      !pages.isLoading.value &&
      pages.error.value === undefined

    if (isStillLatest()) await options.onReachedLatest?.(isStillLatest)

    if (isCurrent()) {
      shouldReceiveLatestMessages.value = pages.isCaughtUp.value
    }
  })

  return {
    messageIds,

    hasReachedOldest: pages.reachedStart,
    isCaughtUp: pages.isCaughtUp,
    isLoading: pages.isLoading,

    error: pages.error,

    lastLoadKind: pages.lastLoadKind,

    reset: pages.reset,
    init: pages.init,

    onLoadOlderMessagesRequest: () => pages.load('previous'),
    onLoadNewerMessagesRequest: () => pages.load('next'),

    onLoadAroundMessagesRequest: (entryMessageId: MessageId) =>
      pages.load('around', { ...source.value, entryMessageId }),

    requestCatchUp: pages.requestCatchUp,
    invalidateLatest: pages.invalidateLatest,
    addNewMessage,
    removeMessage
  }
}

export default useMessageFetcher
