import { ref } from 'vue'

import { createPinia } from 'pinia'

import { useSubscriptionStore } from '/@/store/domain/subscription'

const { fetchThreads, fetchDefaults, listeners } = vi.hoisted(() => ({
  fetchThreads: vi.fn(),
  fetchDefaults: vi.fn(),
  listeners: new Map<string, () => void>()
}))

vi.mock('/@/lib/apis', () => ({
  default: {
    getMyThreadSubscriptions: fetchThreads,
    getMyThreadSubscriptionDefaults: fetchDefaults,
    getMyUnreadChannels: vi.fn().mockResolvedValue({ data: [] }),
    getMyChannelSubscriptions: vi.fn().mockResolvedValue({ data: [] })
  }
}))

vi.mock('/@/lib/websocket', () => ({
  wsListener: {
    on: (event: string, listener: () => void) => listeners.set(event, listener)
  }
}))

const channelsMap = ref(new Map<string, { force: boolean }>())
const threadsMap = ref(new Map<string, { parentId: string }>())

vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({ channelsMap })
}))

vi.mock('/@/store/entities/threads', () => ({
  useThreadsStore: () => ({ threadsMap })
}))

vi.mock('/@/store/domain/me', () => ({ useMeStore: () => ({}) }))

vi.mock('/@/store/domain/viewStates', () => ({
  useViewStatesStore: () => ({})
}))

vi.mock('/@/store/entities/messages', () => ({ messageMitt: { on: vi.fn() } }))

vi.mock('/@/lib/notification/notification', () => ({
  removeNotification: vi.fn()
}))

const cases = [
  {
    fetch: fetchThreads,
    load: 'fetchThreadSubscriptions',
    get: 'getThreadSubscriptionLevel',
    event: 'THREAD_SUBSCRIBERS_CHANGED'
  },
  {
    fetch: fetchDefaults,
    load: 'fetchThreadSubscriptionDefaults',
    get: 'getThreadSubscriptionDefaultLevel',
    event: 'THREAD_DEFAULT_SUBSCRIBERS_CHANGED'
  }
] as const

describe.each(cases)('$load', ({ fetch, load, get, event }) => {
  beforeEach(() => {
    vi.clearAllMocks()
    listeners.clear()
    fetchThreads.mockResolvedValue({ data: [] })
    fetchDefaults.mockResolvedValue({ data: [] })
  })

  it('caches explicit levels, defaults to inherit, and replaces stale entries on refresh', async () => {
    fetch.mockResolvedValueOnce({ data: [{ channelId: 'a', level: 0 }] })
    const store = useSubscriptionStore(createPinia())

    await store[load]()

    expect(store[get]('a')).toBe(0)
    expect(store[get]('missing')).toBe(-1)

    await store[load]()

    expect(fetch).toHaveBeenCalledTimes(1)

    await store[load]({ ignoreCache: true })

    expect(store[get]('a')).toBe(-1)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retries a failed initial fetch', async () => {
    fetch.mockRejectedValueOnce(new Error('network'))
    const store = useSubscriptionStore(createPinia())

    await expect(store[load]()).rejects.toThrow('network')
    await store[load]()

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('refreshes on subscription changes and reconnect', async () => {
    const store = useSubscriptionStore(createPinia())

    await store[load]()

    listeners.get(event)?.()

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))

    listeners.get('reconnect')?.()

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3))
  })
})

describe('getEffectiveSubscriptionLevel', () => {
  beforeEach(() => {
    channelsMap.value = new Map([['parent', { force: false }]])
    threadsMap.value = new Map([['thread', { parentId: 'parent' }]])
  })

  it.each([0, 1, 2] as const)(
    'prioritizes explicit thread level %i over a forced parent',
    level => {
      const store = useSubscriptionStore(createPinia())
      channelsMap.value.set('parent', { force: true })
      store.threadSubscriptionMap.value.set('thread', level)
      store.threadSubscriptionDefaultMap.value.set('parent', 2)

      expect(store.getEffectiveSubscriptionLevel('thread')).toBe(level)
    }
  )

  it.each([0, 1, 2] as const)(
    'prioritizes default level %i over a forced parent',
    level => {
      const store = useSubscriptionStore(createPinia())
      channelsMap.value.set('parent', { force: true })
      store.threadSubscriptionDefaultMap.value.set('parent', level)

      expect(store.getEffectiveSubscriptionLevel('thread')).toBe(level)
    }
  )

  it.each([0, 1, 2] as const)(
    'inherits parent level %i through explicit inherit settings',
    level => {
      const store = useSubscriptionStore(createPinia())
      store.threadSubscriptionMap.value.set('thread', -1)
      store.threadSubscriptionDefaultMap.value.set('parent', -1)
      store.subscriptionMap.value.set('parent', level)

      expect(store.getEffectiveSubscriptionLevel('thread')).toBe(level)
    }
  )

  it('inherits forced notifications when both settings are omitted', () => {
    const store = useSubscriptionStore(createPinia())
    channelsMap.value.set('parent', { force: true })

    expect(store.getEffectiveSubscriptionLevel('thread')).toBe(2)
  })

  it.each([0, 1, 2] as const)('returns normal channel level %i', level => {
    const store = useSubscriptionStore(createPinia())
    store.subscriptionMap.value.set('parent', level)

    expect(store.getEffectiveSubscriptionLevel('parent')).toBe(level)
  })

  it('returns notified for a forced normal channel', () => {
    const store = useSubscriptionStore(createPinia())
    channelsMap.value.set('parent', { force: true })

    expect(store.getEffectiveSubscriptionLevel('parent')).toBe(2)
  })

  it('defaults to none when the parent has no subscription', () => {
    const store = useSubscriptionStore(createPinia())

    expect(store.getEffectiveSubscriptionLevel('thread')).toBe(0)
  })

  it('returns undefined for missing thread or parent metadata', () => {
    const store = useSubscriptionStore(createPinia())

    expect(store.getEffectiveSubscriptionLevel('unknown')).toBeUndefined()

    channelsMap.value.clear()

    expect(store.getEffectiveSubscriptionLevel('thread')).toBeUndefined()
  })
})
