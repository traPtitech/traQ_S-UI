import type { Message } from '@traptitech/traq'

import { flushPromises } from '@vue/test-utils'
import { createPinia, disposePinia, setActivePinia } from 'pinia'

import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import { useStampUpdater } from '/@/lib/updater/stamp'
import { messageMitt, useMessagesStore } from '/@/store/entities/messages'

import { withSetup } from '../../testUtils'

const mocks = vi.hoisted(() => ({
  getMessage: vi.fn(),
  addMessageStamp: vi.fn(),
  render: vi.fn(),
  myId: 'me' as string | undefined,
  handlers: new Map<string, (payload: unknown) => void>()
}))

vi.mock('/@/lib/apis', () => ({
  default: {
    getMessage: mocks.getMessage,
    addMessageStamp: mocks.addMessageStamp,
    removeMessageStamp: vi.fn(),
    getFileMeta: vi.fn(),
    getOgp: vi.fn()
  }
}))

vi.mock('/@/lib/websocket', () => ({
  wsListener: {
    on: (event: string, handler: (payload: unknown) => void) => {
      mocks.handlers.set(event, handler)
    }
  }
}))

vi.mock('/@/store/domain/me', () => ({
  useMeStore: () => ({
    myId: {
      get value() {
        return mocks.myId
      }
    }
  })
}))

vi.mock('/@/store/domain/messagesView', () => ({
  useMessagesView: () => ({
    renderMessageContent: mocks.render,
    resetRenderedContent: vi.fn()
  })
}))

vi.mock('/@/store/domain/viewStateSenderStore', async () => {
  const { ref } = await import('vue')

  return {
    useViewStateSenderStore: () => ({ shouldReceiveLatestMessages: ref(false) })
  }
})

vi.mock('/@/store/domain/stampHistory', () => ({
  useStampHistory: () => ({ upsertLocalStampHistory: vi.fn() })
}))
vi.mock('/@/store/domain/stampRecommendations', () => ({
  useStampRecommendations: () => ({ recordStampUsage: vi.fn() })
}))
vi.mock('/@/store/ui/toast', () => ({
  useToastStore: () => ({ addErrorToast: vi.fn() })
}))

const disposers: Array<() => void> = []

const message = (): Message => ({
  id: 'target',
  channelId: 'channel',
  threadId: null,
  userId: 'user',
  content: 'target',
  createdAt: '2026-11-06T00:00:00Z',
  updatedAt: '2026-11-06T00:00:00Z',
  pinned: false,
  stamps: []
})

const stamp = (userId = 'me', count = 1) => ({
  stampId: 'stamp',
  userId,
  count,
  createdAt: '2026-11-06T00:00:00Z',
  updatedAt: '2026-11-06T00:00:00Z'
})

const emit = (event: string, payload: unknown) => {
  const handler = mocks.handlers.get(event)
  if (!handler) throw new Error(`Missing handler for ${event}`)
  handler(payload)
}

const stamped = (userId = 'me', count = 1) =>
  emit('MESSAGE_STAMPED', {
    message_id: 'target',
    stamp_id: 'stamp',
    user_id: userId,
    count,
    created_at: '2026-11-06T00:00:00Z'
  })

const createJump = (around: (entry: Message) => Promise<Message[]>) => {
  const [fetcher, { unmount }] = withSetup(() =>
    useMessageFetcher({
      source: () => 'channel',
      entryMessageId: () => 'target',
      initialCursor: () => 0,
      limit: 20,

      load: {
        older: async () => ({ messages: [], cursor: 0 }),

        around: async ({ entryMessage }) => ({
          messages: await around(entryMessage),
          cursor: 0
        })
      }
    })
  )()

  disposers.push(unmount)

  return fetcher
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.handlers.clear()
  mocks.myId = 'me'
  mocks.render.mockResolvedValue(undefined)
  const pinia = createPinia()
  setActivePinia(pinia)
  useMessagesStore(pinia)
  disposers.push(() => disposePinia(pinia))
})

afterEach(() =>
  disposers
    .splice(0)
    .reverse()
    .forEach(dispose => dispose())
)

it.each(['stamp', 'pin'])(
  'keeps %s updates received after entry lookup and before the surrounding page',
  async update => {
    const entry = message()
    const surrounding = Promise.withResolvers<void>()
    mocks.getMessage.mockResolvedValueOnce({ data: entry })
    const store = useMessagesStore()

    const fetcher = createJump(async entry => {
      await surrounding.promise

      return [entry]
    })

    await flushPromises()

    const onUpdated = mocks.handlers.get(
      update === 'stamp' ? 'MESSAGE_STAMPED' : 'MESSAGE_PINNED'
    )

    expect(onUpdated).toBeDefined()

    onUpdated?.({
      message_id: entry.id,
      stamp_id: 'stamp',
      user_id: 'stamper',
      count: 1,
      created_at: entry.createdAt
    })

    surrounding.resolve()
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual([entry.id])

    if (update === 'stamp') {
      expect(store.messagesMap.value.get(entry.id)?.stamps).toEqual([
        expect.objectContaining({
          stampId: 'stamp',
          userId: 'stamper',
          count: 1
        })
      ])
    } else {
      expect(store.messagesMap.value.get(entry.id)?.pinned).toBe(true)
    }
  }
)

it('does not cache an entry lookup invalidated before it resolves', async () => {
  const pending = Promise.withResolvers<{ data: Message }>()
  mocks.getMessage.mockReturnValueOnce(pending.promise)
  const store = useMessagesStore()
  const fetcher = createJump(async entry => [entry])
  await flushPromises()
  fetcher.reset()
  pending.resolve({ data: message() })
  await flushPromises()

  expect(store.messagesMap.value.size).toBe(0)
  expect(fetcher.messageIds.value).toEqual([])
})

it('keeps newer cached content when a single-message response finishes late', async () => {
  const pending = Promise.withResolvers<{ data: Message }>()
  mocks.getMessage.mockReturnValueOnce(pending.promise)
  const store = useMessagesStore()
  const request = store.fetchMessage({ messageId: 'target' })

  const current = {
    ...message(),
    content: 'current',
    updatedAt: '2026-11-07T00:00:00Z'
  }

  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([current])
  )
  pending.resolve({ data: message() })

  await expect(request).resolves.toMatchObject({ content: 'current' })
  expect(store.messagesMap.value.get('target')?.content).toBe('current')
})

it('accepts stamp and pin snapshots with the same body update time', async () => {
  const store = useMessagesStore()
  const original = message()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([original])
  )

  const current = {
    ...original,
    pinned: true,
    stamps: [
      {
        stampId: 'stamp',
        userId: 'user',
        count: 2,
        createdAt: original.createdAt,
        updatedAt: original.updatedAt
      }
    ]
  }

  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([current])
  )

  expect(store.messagesMap.value.get(original.id)?.pinned).toBe(true)
  expect(store.messagesMap.value.get(original.id)?.stamps[0]?.count).toBe(2)
})

it.each(['stamp', 'unstamp', 'pin', 'unpin'] as const)(
  'reapplies %s updates to concurrent reads that finish in reverse order',
  async update => {
    const store = useMessagesStore()
    const snapshot = { ...message(), pinned: true, stamps: [stamp()] }
    await store.withMessageUpdates(async cacheMessages =>
      cacheMessages([snapshot])
    )
    const first = Promise.withResolvers<Message[]>()
    const second = Promise.withResolvers<Message[]>()
    const older = store.withMessageUpdates(async cacheMessages =>
      cacheMessages(await first.promise)
    )
    const newer = store.withMessageUpdates(async cacheMessages =>
      cacheMessages(await second.promise)
    )

    if (update === 'stamp' || update === 'unstamp') {
      mocks.getMessage.mockResolvedValueOnce({
        data: {
          ...snapshot,
          stamps: [
            ...(update === 'stamp' ? [stamp('me', 2)] : []),
            stamp('other', 3)
          ]
        }
      })
    }

    if (update === 'stamp') stamped('me', 2)
    else if (update === 'unstamp')
      emit('MESSAGE_UNSTAMPED', {
        message_id: 'target',
        stamp_id: 'stamp',
        user_id: 'me'
      })
    else
      emit(update === 'pin' ? 'MESSAGE_PINNED' : 'MESSAGE_UNPINNED', {
        message_id: 'target'
      })

    const incoming = {
      ...snapshot,
      pinned: update !== 'pin',
      stamps: [...snapshot.stamps, stamp('other', 3)]
    }
    second.resolve([incoming])
    await newer
    first.resolve([incoming])
    await older
    const current = store.messagesMap.value.get('target')

    if (update === 'stamp' || update === 'unstamp') {
      expect(current?.stamps.find(s => s.userId === 'me')?.count ?? 0).toBe(
        update === 'stamp' ? 2 : 0
      )
    } else {
      expect(current?.pinned).toBe(update === 'pin')
    }

    expect(current?.stamps.find(s => s.userId === 'other')?.count).toBe(3)
  }
)

it('does not resurrect a message deleted during rendering or in a subsequent read', async () => {
  const rendering = Promise.withResolvers<void>()
  const entry = message()
  mocks.getMessage.mockResolvedValueOnce({ data: entry })
  mocks.render.mockReturnValueOnce(rendering.promise)
  const store = useMessagesStore()
  const fetcher = createJump(async message => [message])
  await flushPromises()
  emit('MESSAGE_DELETED', { id: entry.id })
  rendering.resolve()
  await flushPromises()

  const merged = await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([entry])
  )

  expect(merged).toEqual([])
  expect(store.messagesMap.value.has(entry.id)).toBe(false)
  expect(fetcher.messageIds.value).toEqual([])
  expect(fetcher.isLoading.value).toBe(false)
})

it('stops replaying completed reads and rejects writes from aborted reads', async () => {
  const store = useMessagesStore()

  await store.withMessageUpdates(async cacheMessages => {
    emit('MESSAGE_PINNED', { message_id: 'target' })
    expect(cacheMessages([message()])[0]?.pinned).toBe(true)
  })

  const controller = new AbortController()
  const pending = Promise.withResolvers<void>()

  const cancelled = store.withMessageUpdates(async cacheMessages => {
    await pending.promise
    return cacheMessages([message()])
  }, controller.signal)

  controller.abort()
  emit('MESSAGE_PINNED', { message_id: 'target' })
  pending.resolve()
  await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' })

  const current = await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  expect(current[0]?.pinned).toBe(false)
})

it.each(['pending', 'acknowledged', 'rolled back'] as const)(
  'keeps a %s optimistic stamp without duplicating it or losing unrelated stamps',
  async state => {
    const store = useMessagesStore()
    await store.withMessageUpdates(async cacheMessages =>
      cacheMessages([message()])
    )
    const undo = store.addStampLocally('target', 'stamp')
    const pending = Promise.withResolvers<Message[]>()
    const read = store.withMessageUpdates(async cacheMessages =>
      cacheMessages(await pending.promise)
    )

    if (state === 'acknowledged') stamped()
    else if (state === 'rolled back') {
      mocks.getMessage.mockResolvedValueOnce({
        data: { ...message(), stamps: [stamp('other', 3)] }
      })
      await undo?.rollback()
    }

    pending.resolve([{ ...message(), stamps: [stamp('other', 3)] }])
    const [current] = await read

    expect(current?.stamps.find(s => s.userId === 'me')?.count ?? 0).toBe(
      state === 'rolled back' ? 0 : 1
    )
    expect(current?.stamps.find(s => s.userId === 'other')?.count).toBe(3)
  }
)

it('does not acknowledge a local optimistic stamp with another user’s event', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  store.addStampLocally('target', 'stamp')
  stamped('other', 2)

  const current = await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )

  expect(current[0]?.stamps.find(s => s.userId === 'me')?.count).toBe(1)
})

it.each(['pending', 'acknowledged', 'rolled back'] as const)(
  'preserves a %s optimistic removal while merging a stale snapshot',
  async state => {
    const store = useMessagesStore()
    const snapshot = {
      ...message(),
      stamps: [stamp('me', 2), stamp('other', 3)]
    }
    await store.withMessageUpdates(async cacheMessages =>
      cacheMessages([snapshot])
    )
    const pending = Promise.withResolvers<Message[]>()
    const read = store.withMessageUpdates(async cacheMessages =>
      cacheMessages(await pending.promise)
    )
    const undo = store.removeStampLocally('target', 'stamp')

    if (state === 'acknowledged')
      emit('MESSAGE_UNSTAMPED', {
        message_id: 'target',
        stamp_id: 'stamp',
        user_id: 'me'
      })
    else if (state === 'rolled back') {
      mocks.getMessage.mockResolvedValueOnce({ data: snapshot })
      await undo?.rollback()
    }

    pending.resolve([snapshot])
    const [current] = await read

    expect(current?.stamps.find(s => s.userId === 'me')?.count ?? 0).toBe(
      state === 'rolled back' ? 2 : 0
    )
    expect(current?.stamps.find(s => s.userId === 'other')?.count).toBe(3)
  }
)

it('shares the read and its live updates between single-message fetch consumers', async () => {
  const pending = Promise.withResolvers<{ data: Message }>()
  mocks.getMessage.mockReturnValueOnce(pending.promise)
  const store = useMessagesStore()
  const first = store.fetchMessage({ messageId: 'target' })
  stamped('other', 2)
  const second = store.fetchMessage({ messageId: 'target' })
  pending.resolve({ data: message() })
  const results = await Promise.all([first, second])

  expect(mocks.getMessage).toHaveBeenCalledTimes(1)
  expect(results.map(message => message.stamps[0]?.count)).toEqual([2, 2])
})

it.each(['add', 'remove'] as const)(
  'recovers the server state for %s after an ambiguous HTTP failure',
  async action => {
    const store = useMessagesStore()
    await store.withMessageUpdates(async cacheMessages =>
      cacheMessages([
        { ...message(), stamps: action === 'remove' ? [stamp()] : [] }
      ])
    )
    const undo =
      action === 'add'
        ? store.addStampLocally('target', 'stamp')
        : store.removeStampLocally('target', 'stamp')

    if (action === 'add') stamped()
    else
      emit('MESSAGE_UNSTAMPED', {
        message_id: 'target',
        stamp_id: 'stamp',
        user_id: 'me'
      })

    mocks.getMessage.mockResolvedValueOnce({
      data: { ...message(), stamps: action === 'add' ? [stamp()] : [] }
    })
    await undo?.rollback()

    expect(store.messagesMap.value.get('target')?.stamps.length).toBe(
      action === 'add' ? 1 : 0
    )
  }
)

it('does not double-count an optimistic stamp already included in a fetched snapshot', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  store.addStampLocally('target', 'stamp')

  const current = await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([{ ...message(), stamps: [stamp()] }])
  )

  expect(current[0]?.stamps[0]?.count).toBe(1)
})

it('accepts server stamps after HTTP success without a WebSocket acknowledgement', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  const { addStampOptimistically } = useStampUpdater()
  mocks.getMessage.mockResolvedValueOnce({
    data: { ...message(), stamps: [stamp()] }
  })
  await addStampOptimistically('target', 'stamp')
  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(1)

  mocks.getMessage.mockResolvedValueOnce({
    data: { ...message(), stamps: [stamp('me', 2)] }
  })
  await store.fetchMessage({ messageId: 'target', ignoreCache: true })
  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(2)
})

it('accepts server stamps after a successful removal without a WebSocket acknowledgement', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([{ ...message(), stamps: [stamp()] }])
  )
  const { removeStampOptimistically } = useStampUpdater()
  mocks.getMessage.mockResolvedValueOnce({ data: message() })
  await removeStampOptimistically('target', 'stamp')

  mocks.getMessage.mockResolvedValueOnce({
    data: { ...message(), stamps: [stamp('me', 2)] }
  })
  await store.fetchMessage({ messageId: 'target', ignoreCache: true })

  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(2)
})

it('protects a successful stamp from a read started before HTTP completion', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  const operation = store.addStampLocally('target', 'stamp')
  const pending = Promise.withResolvers<{ data: Message }>()
  mocks.getMessage.mockReturnValueOnce(pending.promise)
  const read = store.fetchMessage({ messageId: 'target', ignoreCache: true })

  mocks.getMessage.mockResolvedValueOnce({
    data: { ...message(), stamps: [stamp()] }
  })
  await operation?.commit()
  pending.resolve({ data: message() })
  const current = await read

  expect(current.stamps[0]?.count).toBe(1)
})

it('does not acknowledge a later pending stamp with an earlier committed stamp notification', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  mocks.getMessage.mockResolvedValue({
    data: { ...message(), stamps: [stamp()] }
  })
  const first = store.addStampLocally('target', 'stamp')
  const second = store.addStampLocally('target', 'stamp')
  await first?.commit()
  stamped('me', 1)

  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(2)

  await second?.rollback()

  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(1)
})

it('reconciles a delayed notification with the current server stamps', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  mocks.getMessage.mockResolvedValue({
    data: { ...message(), stamps: [stamp('me', 3)] }
  })
  await store.addStampLocally('target', 'stamp')?.commit()
  await store.fetchMessage({ messageId: 'target', ignoreCache: true })

  stamped('me', 1)
  await flushPromises()

  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(3)
})

it('settles the specific stamp operation when parallel HTTP requests finish out of order', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  const first = store.addStampLocally('target', 'stamp')
  const second = store.addStampLocally('target', 'stamp')
  mocks.getMessage.mockResolvedValue({
    data: { ...message(), stamps: [stamp('me', 3)] }
  })
  await second?.rollback()
  await first?.commit()
  const current = await store.fetchMessage({
    messageId: 'target',
    ignoreCache: true
  })

  expect(current.stamps[0]?.count).toBe(3)
})

it('publishes ready messages without waiting for an earlier message lookup', async () => {
  const first = Promise.withResolvers<{ data: Message }>()
  const second = { ...message(), id: 'second' }
  mocks.getMessage
    .mockReturnValueOnce(first.promise)
    .mockResolvedValueOnce({ data: second })
  const received: string[] = []
  const onMessage = ({ message }: { message: Message }) => {
    received.push(message.id)
  }
  messageMitt.on('addMessage', onMessage)
  disposers.push(() => messageMitt.off('addMessage', onMessage))

  emit('MESSAGE_CREATED', { id: 'target', is_citing: false })
  emit('MESSAGE_CREATED', { id: 'second', is_citing: false })
  await flushPromises()

  expect(mocks.getMessage).toHaveBeenCalledTimes(2)
  expect(received).toEqual(['second'])

  first.resolve({ data: message() })
  await flushPromises()

  expect(received).toEqual(['second', 'target'])
})

it('publishes an available message from another channel after reconnect while an old request is pending', async () => {
  const store = useMessagesStore()
  const pending = Promise.withResolvers<{ data: Message }>()
  const other = { ...message(), id: 'other', channelId: 'other-channel' }
  mocks.getMessage
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce({ data: other })
  const received: string[] = []
  const handler = ({ message }: { message: Message }) => {
    received.push(message.id)
  }
  messageMitt.on('addMessage', handler)
  disposers.push(() => messageMitt.off('addMessage', handler))

  emit('MESSAGE_CREATED', { id: 'target', is_citing: false })
  emit('reconnect', undefined)
  emit('MESSAGE_CREATED', { id: 'other', is_citing: false })
  await flushPromises()
  const receivedWhileOldRequestIsPending = [...received]
  const otherWasCached = store.messagesMap.value.has('other')
  pending.resolve({ data: message() })
  await flushPromises()

  expect(otherWasCached).toBe(true)
  expect(receivedWhileOldRequestIsPending).toEqual(['other'])
})

it('rolls back the failed first stamp when only the second HTTP operation succeeds', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  const first = store.addStampLocally('target', 'stamp')
  const second = store.addStampLocally('target', 'stamp')

  mocks.getMessage.mockResolvedValueOnce({
    data: { ...message(), stamps: [stamp('me', 1)] }
  })
  await second?.commit()
  stamped('me', 1)
  await first?.rollback()

  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(1)
})

it('reconciles parallel HTTP stamp results without treating notifications as request acknowledgements', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  const firstHTTP = Promise.withResolvers<void>()
  const secondHTTP = Promise.withResolvers<void>()
  mocks.addMessageStamp
    .mockReturnValueOnce(firstHTTP.promise)
    .mockReturnValueOnce(secondHTTP.promise)
  mocks.getMessage.mockResolvedValueOnce({
    data: { ...message(), stamps: [stamp()] }
  })
  const { addStampOptimistically } = useStampUpdater()
  const first = addStampOptimistically('target', 'stamp')
  const second = addStampOptimistically('target', 'stamp')

  secondHTTP.resolve()
  await second
  stamped()
  expect(mocks.getMessage).not.toHaveBeenCalled()

  firstHTTP.reject(new Error('offline'))
  await first

  expect(mocks.getMessage).toHaveBeenCalledOnce()
  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(1)
})

it('preserves a new optimistic operation while an earlier reconciliation finishes', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  const pending = Promise.withResolvers<{ data: Message }>()
  mocks.getMessage
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce({ data: { ...message(), stamps: [stamp('me', 2)] } })
  const first = store.addStampLocally('target', 'stamp')
  const finishingFirst = first?.commit()
  const second = store.addStampLocally('target', 'stamp')

  pending.resolve({ data: { ...message(), stamps: [stamp()] } })
  await finishingFirst
  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(2)

  await second?.commit()

  expect(mocks.getMessage).toHaveBeenCalledTimes(2)
  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(2)
})

it('fetches again if a notification arrives while reconciling settled operations', async () => {
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  const pending = Promise.withResolvers<{ data: Message }>()
  mocks.getMessage
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce({ data: { ...message(), stamps: [stamp('me', 2)] } })
  const finishing = store.addStampLocally('target', 'stamp')?.commit()

  stamped()
  pending.resolve({ data: message() })
  await finishing

  expect(mocks.getMessage).toHaveBeenCalledTimes(2)
  expect(store.messagesMap.value.get('target')?.stamps[0]?.count).toBe(2)
})

it('accepts later snapshots after stamp reconciliation fails', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const store = useMessagesStore()
  await store.withMessageUpdates(async cacheMessages =>
    cacheMessages([message()])
  )
  mocks.getMessage.mockRejectedValueOnce(new Error('offline'))
  await store.addStampLocally('target', 'stamp')?.commit()
  mocks.getMessage.mockResolvedValueOnce({
    data: { ...message(), stamps: [stamp('me', 3)] }
  })

  const current = await store.fetchMessage({
    messageId: 'target',
    ignoreCache: true
  })

  expect(log).toHaveBeenCalledOnce()
  expect(current.stamps[0]?.count).toBe(3)
  log.mockRestore()
})
