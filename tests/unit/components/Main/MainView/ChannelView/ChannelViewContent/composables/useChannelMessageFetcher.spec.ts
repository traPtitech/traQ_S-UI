import type { Message, UnreadChannel } from '@traptitech/traq'

import { reactive, shallowRef } from 'vue'

import { flushPromises } from '@vue/test-utils'
import { createPinia, disposePinia, setActivePinia } from 'pinia'

import type * as MessagesStoreModule from '/@/store/entities/messages'
import useChannelMessageFetcher from '/@/components/Main/MainView/ChannelView/ChannelViewContent/composables/useChannelMessageFetcher'
import { wsListener } from '/@/lib/websocket'
import { messageMitt } from '/@/store/entities/messages'

import { withSetup } from '../../../../../../testUtils'

const mocks = vi.hoisted(() => ({
  getMessages: vi.fn(),
  render: vi.fn(),
  fetchMessage: vi.fn(),
  waitHeight: vi.fn(),
  unreadReady: vi.fn(),
  read: vi.fn(),
  isDeleted: vi.fn(),
  deleteUnread: vi.fn(),
  unread: new Map<string, UnreadChannel>(),
  messages: new Map<string, Message>()
}))

vi.mock('/@/lib/apis', () => ({
  default: {
    getMessages: mocks.getMessages,
    getFileMeta: vi.fn(),
    getOgp: vi.fn(),

    getMessage: async (messageId: string) => ({
      data: await mocks.fetchMessage({ messageId })
    })
  }
}))

vi.mock('/@/lib/websocket', async () => {
  const { default: mitt } = await import('mitt')

  return { wsListener: mitt() }
})

vi.mock('/@/store/entities/messages', async () => {
  const { default: mitt } = await import('mitt')

  return {
    messageMitt: mitt(),

    useMessagesStore: () => ({
      withMessageUpdates: mocks.read,
      isMessageDeleted: mocks.isDeleted,
      messagesMap: { value: mocks.messages },
      fetchMessage: mocks.fetchMessage
    })
  }
})

vi.mock('/@/store/domain/messagesView', () => ({
  useMessagesView: () => ({
    renderMessageContent: mocks.render,
    resetRenderedContent: vi.fn()
  })
}))

vi.mock('/@/store/domain/me', async () => {
  const { ref } = await import('vue')

  return { useMeStore: () => ({ myId: ref<string>() }) }
})

vi.mock('/@/store/domain/viewStateSenderStore', async () => {
  const { ref } = await import('vue')

  return {
    useViewStateSenderStore: () => ({ shouldReceiveLatestMessages: ref(false) })
  }
})

vi.mock('/@/store/domain/subscription', async () => {
  const { ref } = await import('vue')

  return {
    useSubscriptionStore: () => ({
      unreadChannelsMap: ref(mocks.unread),
      unreadChannelsMapInitialFetchPromise: mocks.unreadReady(),
      deleteUnreadChannelWithSend: mocks.deleteUnread
    })
  }
})

vi.mock(
  '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit',
  async () => {
    const { ref } = await import('vue')

    return {
      default: () => ({
        fetchLimit: ref(2),
        waitHeightResolved: mocks.waitHeight()
      })
    }
  }
)

const message = (id: string, createdAt: string): Message => ({
  id,
  createdAt,
  channelId: 'same-channel',
  threadId: null,
  userId: 'user',
  content: id,
  updatedAt: createdAt,
  pinned: false,
  stamps: []
})

const before = message('before', '2026-11-01T11:03:00Z')
const target = message('target', '2026-11-02T11:40:00Z')
const after = message('after', '2026-11-02T11:41:00Z')
const latest = message('latest', '2026-11-06T00:51:00Z')
const oldest = message('oldest', '2026-10-01T00:00:00Z')

const unread = (firstMessage: Message): UnreadChannel => ({
  channelId: firstMessage.channelId,
  count: 1,
  noticeable: true,
  since: firstMessage.createdAt,
  updatedAt: firstMessage.createdAt,
  oldestMessageId: firstMessage.id
})

const response = (data: Message[], hasMore = true) => ({
  data,
  headers: { 'x-traq-more': String(hasMore) }
})

const disposers: Array<() => void> = []

const websocket = wsListener as typeof wsListener & {
  emit: (event: 'reconnect') => void
}

const create = (entryMessageId?: string) => {
  const props = reactive({ channelId: 'same-channel', entryMessageId })

  const [fetcher, { unmount }] = withSetup(() =>
    useChannelMessageFetcher(shallowRef(), props)
  )()

  disposers.push(unmount)

  return { fetcher, props }
}

beforeEach(async () => {
  vi.resetAllMocks()
  mocks.render.mockResolvedValue(undefined)
  mocks.fetchMessage.mockResolvedValue(target)
  mocks.waitHeight.mockResolvedValue(undefined)
  mocks.unreadReady.mockResolvedValue(undefined)
  mocks.messages.clear()
  mocks.unread.clear()

  const events = wsListener as typeof wsListener & {
    all: Map<unknown, unknown>
  }
  events.all.clear()

  mocks.deleteUnread.mockImplementation(async (channelId: string) => {
    mocks.unread.delete(channelId)
  })

  const pinia = createPinia()
  setActivePinia(pinia)
  disposers.push(() => disposePinia(pinia))

  const { useMessagesStore } = await vi.importActual<
    typeof MessagesStoreModule
  >('/@/store/entities/messages')

  const store = useMessagesStore(pinia)
  store.messagesMap.value = mocks.messages
  mocks.read.mockImplementation(store.withMessageUpdates)
  mocks.isDeleted.mockImplementation(store.isMessageDeleted)
})

afterEach(() => {
  disposers
    .splice(0)
    .reverse()
    .forEach(dispose => dispose())
  vi.restoreAllMocks()
})

it('displays ready live messages while an earlier preview is still loading', async () => {
  mocks.getMessages.mockResolvedValueOnce(response([target], false))
  const { fetcher } = create()
  await flushPromises()
  const pending = Promise.withResolvers<void>()
  const slow = message('slow-preview', '2026-11-07T00:00:00Z')
  const ready = message('ready-text', '2026-11-07T00:00:01Z')
  mocks.messages.set(slow.id, slow)
  mocks.messages.set(ready.id, ready)
  mocks.render.mockImplementation((id: string) =>
    id === slow.id ? pending.promise : Promise.resolve()
  )

  messageMitt.emit('addMessage', { message: slow, isCiting: false })
  await flushPromises()
  messageMitt.emit('addMessage', { message: ready, isCiting: false })
  await flushPromises()
  const whilePreviewIsPending = [...fetcher.messageIds.value]
  pending.resolve()
  await flushPromises()

  expect(whilePreviewIsPending).toEqual([target.id, ready.id])
  expect(fetcher.messageIds.value).toEqual([target.id, slow.id, ready.id])
})

describe('channel message fetch lifecycle', () => {
  it('does not restore an entry deleted while its surrounding pages are loading', async () => {
    const older = Promise.withResolvers<ReturnType<typeof response>>()
    const newer = Promise.withResolvers<ReturnType<typeof response>>()

    mocks.getMessages
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise)

    const { fetcher } = create(target.id)
    await flushPromises()

    const events = wsListener as unknown as {
      emit: (event: string, payload: unknown) => void
    }

    events.emit('MESSAGE_DELETED', { id: target.id })
    older.resolve(response([before], false))
    newer.resolve(response([after], false))
    await flushPromises()

    expect(mocks.messages.has(target.id)).toBe(false)
    expect(fetcher.messageIds.value).toEqual([before.id, after.id])
  })

  it('keeps a stamp received after one surrounding page arrives while the other is pending', async () => {
    const newer = Promise.withResolvers<ReturnType<typeof response>>()
    mocks.messages.set(before.id, { ...before, stamps: [] })

    mocks.getMessages
      .mockResolvedValueOnce(response([{ ...before, stamps: [] }], false))
      .mockReturnValueOnce(newer.promise)

    create(target.id)
    await flushPromises()

    const events = wsListener as unknown as {
      emit: (event: string, payload: unknown) => void
    }

    events.emit('MESSAGE_STAMPED', {
      message_id: before.id,
      stamp_id: 'new-stamp',
      user_id: 'stamper',
      count: 1,
      created_at: latest.createdAt
    })

    expect(mocks.messages.get(before.id)?.stamps).toHaveLength(1)
    newer.resolve(response([after], false))
    await flushPromises()

    expect(mocks.messages.get(before.id)?.stamps).toHaveLength(1)
  })

  it.each([
    ['2026-11-02T11:40:00Z', 'cached'],
    ['2026-11-07T00:00:00Z', 'fetched']
  ])(
    'keeps the newer message when a page has updatedAt=%s',
    async (updatedAt, expectedContent) => {
      mocks.messages.set(target.id, {
        ...target,
        content: 'cached',
        updatedAt: latest.createdAt
      })

      mocks.getMessages.mockResolvedValueOnce(
        response([{ ...target, content: 'fetched', updatedAt }], false)
      )

      const { fetcher } = create()
      await flushPromises()

      expect(fetcher.messageIds.value).toEqual([target.id])
      expect(mocks.messages.get(target.id)?.content).toBe(expectedContent)
      expect(mocks.render).toHaveBeenCalledWith(target.id, expect.any(Function))
    }
  )

  it('preserves an entry edit received while its surrounding pages are loading', async () => {
    const older = Promise.withResolvers<ReturnType<typeof response>>()
    const newer = Promise.withResolvers<ReturnType<typeof response>>()

    mocks.getMessages
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise)

    const { fetcher } = create(target.id)
    await flushPromises()

    const edited = {
      ...target,
      content: 'edited after the jump began',
      updatedAt: latest.createdAt
    }

    mocks.messages.set(target.id, edited)
    messageMitt.emit('updateMessage', edited)
    await flushPromises()
    older.resolve(response([before], false))
    newer.resolve(response([after], false))
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual([before.id, target.id, after.id])
    expect(mocks.messages.get(target.id)?.content).toBe(edited.content)
  })

  it('retries the latest page after an initial fetch failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mocks.getMessages.mockRejectedValueOnce(new Error('offline'))
    const { fetcher } = create()
    await flushPromises()

    mocks.getMessages.mockImplementation(async (...args: unknown[]) =>
      response(args[6] === 'desc' ? [latest, after] : [oldest, before], true)
    )

    websocket.emit('reconnect')
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual([after.id, latest.id])
    expect(fetcher.isCaughtUp.value).toBe(true)
    expect(fetcher.lastLoadKind.value).toBe('latest')
  })

  it.each(['catchUp', 'older'] as const)(
    'preserves the unread boundary after %s when the channel has already been marked read',
    async direction => {
      mocks.unread.set('same-channel', unread(before))
      mocks.getMessages.mockResolvedValueOnce(response([target, before]))
      const { fetcher } = create()
      await flushPromises()

      expect(fetcher.unreadSince.value).toBe(before.createdAt)
      expect(mocks.unread.has('same-channel')).toBe(false)

      mocks.getMessages.mockResolvedValueOnce(
        response(direction === 'catchUp' ? [] : [oldest], false)
      )

      if (direction === 'catchUp') websocket.emit('reconnect')
      else await fetcher.onLoadOlderMessagesRequest()

      await flushPromises()

      expect(mocks.deleteUnread).toHaveBeenCalledTimes(2)
      expect(fetcher.unreadSince.value).toBe(before.createdAt)
    }
  )

  it('updates the unread boundary when fresh unread information is available', async () => {
    mocks.unread.set('same-channel', unread(before))
    mocks.getMessages.mockResolvedValueOnce(response([before], false))
    const { fetcher } = create()
    await flushPromises()

    expect(fetcher.unreadSince.value).toBe(before.createdAt)

    mocks.unread.set('same-channel', unread(latest))
    mocks.getMessages.mockResolvedValueOnce(response([latest], false))
    await fetcher.requestCatchUp()
    await flushPromises()

    expect(fetcher.unreadSince.value).toBe(latest.createdAt)
    expect(mocks.unread.has('same-channel')).toBe(false)
  })

  it('clears the saved unread boundary when switching channels', async () => {
    mocks.unread.set('same-channel', unread(before))
    mocks.getMessages.mockResolvedValueOnce(response([before], false))
    const { fetcher, props } = create()
    await flushPromises()

    expect(fetcher.unreadSince.value).toBe(before.createdAt)

    mocks.getMessages.mockResolvedValueOnce(response([], false))
    props.channelId = 'another-channel'
    await flushPromises()

    expect(fetcher.unreadSince.value).toBeUndefined()
  })

  it('fills a reconnect gap larger than the limit without skipping messages', async () => {
    mocks.getMessages.mockResolvedValueOnce(response([before], false))
    const { fetcher } = create()
    await flushPromises()

    const missed = [1, 2, 3, 4].map(index =>
      message(`missed-${index}`, `2026-11-06T00:0${index}:00Z`)
    )

    mocks.getMessages.mockImplementation(
      async (
        _channel: string,
        limit: number,
        _offset: unknown,
        since: string | undefined,
        _until: unknown,
        _inclusive: unknown,
        order: 'asc' | 'desc'
      ) => {
        const eligible = missed.filter(
          item => !since || Date.parse(item.createdAt) > Date.parse(since)
        )

        const ordered = order === 'desc' ? eligible.toReversed() : eligible

        return response(ordered.slice(0, limit), eligible.length > limit)
      }
    )

    await fetcher.requestCatchUp()

    expect(fetcher.messageIds.value).toEqual([
      before.id,
      'missed-1',
      'missed-2'
    ])

    expect(fetcher.isCaughtUp.value).toBe(false)

    await fetcher.onLoadNewerMessagesRequest()

    expect(fetcher.messageIds.value).toEqual([
      before.id,
      ...missed.map(item => item.id)
    ])

    expect(fetcher.isCaughtUp.value).toBe(true)
  })

  it('marks the latest view as read again after an empty reconnect catchUp succeeds', async () => {
    mocks.getMessages.mockResolvedValueOnce(response([before], false))
    create()
    await flushPromises()

    expect(mocks.deleteUnread).toHaveBeenCalledTimes(1)

    mocks.getMessages.mockResolvedValueOnce(response([], false))
    websocket.emit('reconnect')
    await flushPromises()

    expect(mocks.deleteUnread).toHaveBeenCalledTimes(2)
  })

  it('handles reconnect failures and retries from the same cursor on the next reconnect', async () => {
    const error = new Error('offline')
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mocks.getMessages.mockResolvedValueOnce(response([before], false))
    const { fetcher } = create()
    await flushPromises()

    mocks.getMessages.mockRejectedValueOnce(error)
    websocket.emit('reconnect')
    await flushPromises()

    expect(log).toHaveBeenCalledExactlyOnceWith(error)
    expect(fetcher.isCaughtUp.value).toBe(false)
    expect(fetcher.isLoading.value).toBe(false)
    expect(mocks.deleteUnread).toHaveBeenCalledTimes(1)

    mocks.getMessages.mockResolvedValueOnce(response([after], false))
    websocket.emit('reconnect')
    await flushPromises()

    expect(mocks.getMessages).toHaveBeenLastCalledWith(
      'same-channel',
      2,
      undefined,
      new Date(before.createdAt).toISOString(),
      undefined,
      undefined,
      'asc',
      { signal: expect.any(AbortSignal) }
    )

    expect(fetcher.messageIds.value).toEqual([before.id, after.id])
  })

  it('recovers the missing range before appending live messages after a failed reconnect', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mocks.getMessages.mockResolvedValueOnce(response([before], false))
    const { fetcher } = create()
    await flushPromises()

    mocks.getMessages.mockRejectedValueOnce(new Error('offline'))
    websocket.emit('reconnect')
    await flushPromises()

    mocks.getMessages.mockResolvedValueOnce(response([after], false))
    mocks.messages.set(latest.id, latest)
    messageMitt.emit('addMessage', { message: latest, isCiting: false })
    await flushPromises()

    expect(mocks.getMessages).toHaveBeenCalledTimes(3)
    expect(fetcher.messageIds.value).toEqual([before.id, after.id, latest.id])
    expect(fetcher.isCaughtUp.value).toBe(true)
  })

  it('retains live messages received while preparing the page that reaches the latest message', async () => {
    const rendering = Promise.withResolvers<void>()

    mocks.getMessages
      .mockResolvedValueOnce(response([before]))
      .mockResolvedValueOnce(response([after]))

    const { fetcher } = create(target.id)
    await flushPromises()

    mocks.getMessages.mockResolvedValueOnce(response([latest], false))

    mocks.render.mockImplementation((id: string) =>
      id === latest.id ? rendering.promise : Promise.resolve()
    )

    const request = fetcher.onLoadNewerMessagesRequest()
    await flushPromises()

    expect(fetcher.isCaughtUp.value).toBe(false)

    const live = message('live', '2026-11-06T00:52:00Z')
    mocks.messages.set(live.id, live)
    messageMitt.emit('addMessage', { message: live, isCiting: false })
    await flushPromises()

    expect(fetcher.messageIds.value).not.toContain(live.id)

    rendering.resolve()
    await request
    await flushPromises()

    expect(fetcher.isCaughtUp.value).toBe(true)

    expect(fetcher.messageIds.value).toEqual([
      before.id,
      target.id,
      after.id,
      latest.id,
      live.id
    ])
  })

  it.each(['older', 'newer', 'latest'] as const)(
    'does not overwrite cached edits or stamps from a stale %s response',
    async direction => {
      mocks.getMessages
        .mockResolvedValueOnce(response([before]))
        .mockResolvedValueOnce(response([after], direction !== 'latest'))

      const { fetcher, props } = create(target.id)
      await flushPromises()

      expect(mocks.messages.get(before.id)).toEqual(before)

      const pending = Promise.withResolvers<ReturnType<typeof response>>()
      mocks.getMessages.mockReturnValueOnce(pending.promise)

      const request =
        direction === 'older'
          ? fetcher.onLoadOlderMessagesRequest()
          : direction === 'newer'
            ? fetcher.onLoadNewerMessagesRequest()
            : fetcher.requestCatchUp()

      await flushPromises()

      const original = direction === 'older' ? oldest : latest

      const stamp = {
        stampId: 'stamp',
        userId: 'user',
        count: 1,
        createdAt: original.createdAt,
        updatedAt: original.createdAt
      }

      const oldMessage = { ...original, stamps: [stamp] }

      const freshMessage = {
        ...original,
        content: 'edited',
        stamps: [{ ...stamp, count: 2 }]
      }

      mocks.messages.set(original.id, freshMessage)
      mocks.fetchMessage.mockResolvedValueOnce(freshMessage)

      mocks.getMessages
        .mockResolvedValueOnce(response(direction === 'older' ? [] : [after]))
        .mockResolvedValueOnce(response(direction === 'older' ? [before] : []))

      props.entryMessageId = original.id
      await flushPromises()

      pending.resolve(response([oldMessage], false))
      await request

      expect(fetcher.messageIds.value).toContain(original.id)
      expect(mocks.messages.get(original.id)?.content).toBe('edited')
      expect(mocks.messages.get(original.id)?.stamps[0]?.count).toBe(2)
    }
  )

  it('preserves the jump result, latest cursor and end flags when an old latest response arrives', async () => {
    const pending = Promise.withResolvers<ReturnType<typeof response>>()

    mocks.getMessages
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(response([before]))
      .mockResolvedValueOnce(response([after]))

    const { fetcher, props } = create()
    await flushPromises()
    props.entryMessageId = target.id
    await flushPromises()

    pending.resolve(response([latest], false))
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual([before.id, target.id, after.id])
    expect(fetcher.hasReachedOldest.value).toBe(false)
    expect(fetcher.isCaughtUp.value).toBe(false)

    mocks.getMessages.mockResolvedValueOnce(response([latest], false))
    await fetcher.onLoadNewerMessagesRequest()

    expect(mocks.getMessages).toHaveBeenLastCalledWith(
      'same-channel',
      2,
      undefined,
      new Date(after.createdAt).toISOString(),
      undefined,
      undefined,
      'asc',
      { signal: expect.any(AbortSignal) }
    )

    expect(fetcher.messageIds.value).toEqual([
      before.id,
      target.id,
      after.id,
      latest.id
    ])

    expect(fetcher.isCaughtUp.value).toBe(true)
  })

  it('preserves the oldest cursor when a previous jump finishes late', async () => {
    const pending = Promise.withResolvers<ReturnType<typeof response>>()
    mocks.fetchMessage.mockResolvedValueOnce(latest)

    mocks.getMessages
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([before]))
      .mockResolvedValueOnce(response([after]))

    const { fetcher, props } = create(latest.id)
    await flushPromises()
    props.entryMessageId = target.id
    await flushPromises()
    pending.resolve(response([oldest], false))
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual([before.id, target.id, after.id])
    expect(fetcher.hasReachedOldest.value).toBe(false)

    mocks.getMessages.mockResolvedValueOnce(response([], false))
    await fetcher.onLoadOlderMessagesRequest()

    expect(mocks.getMessages).toHaveBeenLastCalledWith(
      'same-channel',
      2,
      undefined,
      undefined,
      new Date(before.createdAt).toISOString(),
      undefined,
      'desc',
      { signal: expect.any(AbortSignal) }
    )

    expect(fetcher.hasReachedOldest.value).toBe(true)
  })

  it('does not start obsolete requests after waiting for the viewport height', async () => {
    const height = Promise.withResolvers<void>()
    mocks.waitHeight.mockReturnValueOnce(height.promise)

    mocks.getMessages
      .mockResolvedValueOnce(response([before]))
      .mockResolvedValueOnce(response([after]))

    const { fetcher, props } = create()
    await flushPromises()
    props.entryMessageId = target.id
    await flushPromises()
    height.resolve()
    await flushPromises()

    expect(mocks.getMessages).toHaveBeenCalledTimes(2)

    expect(mocks.getMessages).toHaveBeenNthCalledWith(
      1,
      'same-channel',
      2,
      undefined,
      undefined,
      new Date(target.createdAt).toISOString(),
      undefined,
      'desc',
      { signal: expect.any(AbortSignal) }
    )

    expect(fetcher.messageIds.value).toEqual([before.id, target.id, after.id])
  })

  it('initializes once when the channel and entry change together', async () => {
    mocks.getMessages.mockResolvedValueOnce(response([]))
    const { fetcher, props } = create()
    await flushPromises()
    mocks.getMessages.mockClear()

    mocks.getMessages
      .mockResolvedValueOnce(response([before]))
      .mockResolvedValueOnce(response([after]))

    props.channelId = 'another-channel'
    props.entryMessageId = target.id
    await flushPromises()

    expect(mocks.getMessages).toHaveBeenCalledTimes(2)

    expect(
      mocks.getMessages.mock.calls.every(call => call[0] === 'another-channel')
    ).toBe(true)

    expect(fetcher.messageIds.value).toEqual([before.id, target.id, after.id])
  })
})

it('preserves a failed reconnect catch-up after successful older pagination', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  mocks.getMessages.mockResolvedValueOnce(response([target], true))
  const { fetcher } = create()
  await flushPromises()

  mocks.getMessages.mockRejectedValueOnce(new Error('offline'))
  websocket.emit('reconnect')
  await flushPromises()
  expect(fetcher.error.value).toBeDefined()

  mocks.getMessages.mockResolvedValueOnce(response([before], false))
  await fetcher.onLoadOlderMessagesRequest()
  await flushPromises()

  mocks.getMessages.mockResolvedValueOnce(response([after], false))
  mocks.messages.set(latest.id, latest)
  messageMitt.emit('addMessage', { message: latest, isCiting: false })
  await flushPromises()

  expect(fetcher.messageIds.value).toEqual([
    before.id,
    target.id,
    after.id,
    latest.id
  ])
})

it('keeps unread messages unread when only older pagination recovers', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  mocks.getMessages.mockResolvedValueOnce(response([target], true))
  const { fetcher } = create()
  await flushPromises()

  mocks.getMessages.mockRejectedValueOnce(new Error('offline'))
  websocket.emit('reconnect')
  await flushPromises()

  mocks.unread.set(after.channelId, unread(after))
  mocks.deleteUnread.mockClear()
  mocks.getMessages.mockResolvedValueOnce(response([before], false))
  await fetcher.onLoadOlderMessagesRequest()
  await flushPromises()

  expect(mocks.deleteUnread).not.toHaveBeenCalled()
})

it('does not mark the view read if catch-up fails while waiting for unread initialization', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const pending = Promise.withResolvers<void>()
  mocks.unreadReady.mockReturnValueOnce(pending.promise)
  mocks.getMessages.mockResolvedValueOnce(response([target], true))
  create()
  await flushPromises()

  mocks.getMessages.mockRejectedValueOnce(new Error('offline'))
  websocket.emit('reconnect')
  await flushPromises()
  pending.resolve()
  await flushPromises()

  expect(mocks.deleteUnread).not.toHaveBeenCalled()
})

it('retries the missing latest range from newer pagination after a reconnect failure', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  mocks.getMessages.mockResolvedValueOnce(response([target], true))
  const { fetcher } = create()
  await flushPromises()

  mocks.getMessages.mockRejectedValueOnce(new Error('offline'))
  websocket.emit('reconnect')
  await flushPromises()

  mocks.getMessages.mockResolvedValueOnce(response([after], false))
  await fetcher.onLoadNewerMessagesRequest()
  await flushPromises()

  expect(fetcher.messageIds.value).toEqual([target.id, after.id])
})

it('marks the latest page read after retrying an initial failure through older pagination', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  mocks.getMessages.mockRejectedValueOnce(new Error('offline'))
  const { fetcher } = create()
  await flushPromises()

  mocks.unread.set(target.channelId, unread(target))
  mocks.getMessages.mockResolvedValueOnce(response([target], false))
  await fetcher.onLoadOlderMessagesRequest()
  await flushPromises()

  expect(fetcher.messageIds.value).toEqual([target.id])
  expect(mocks.deleteUnread).toHaveBeenCalledOnce()
})

it.each([
  ['2026-11-06T00:51:00Z', '2026-11-06T00:52:00Z'],
  ['2026-11-06T00:51:00.000000001Z', '2026-11-06T00:51:00.000000002Z']
])(
  'orders live messages by full creation time when lookups finish in reverse order (%s)',
  async (firstTime, secondTime) => {
    mocks.getMessages.mockResolvedValueOnce(response([target], true))
    const { fetcher } = create()
    await flushPromises()
    const first = message('first-live', firstTime)
    const second = message('second-live', secondTime)
    mocks.messages.set(first.id, first)
    mocks.messages.set(second.id, second)

    messageMitt.emit('addMessage', { message: second, isCiting: false })
    messageMitt.emit('addMessage', { message: first, isCiting: false })
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual([target.id, first.id, second.id])
  }
)
