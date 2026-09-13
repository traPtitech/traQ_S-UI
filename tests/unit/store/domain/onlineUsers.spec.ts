import { createPinia, setActivePinia } from 'pinia'

import { useOnlineUsers } from '/@/store/domain/onlineUsers'
import type { UserId } from '/@/types/entity-ids'

const { mockGetOnlineUsers, mockWsListener } = vi.hoisted(() => {
  const listeners = new Map<string, Set<(payload: unknown) => void>>()

  return {
    mockGetOnlineUsers: vi.fn(),
    mockWsListener: {
      on: vi.fn((type: string, listener: (payload: unknown) => void) => {
        const typeListeners = listeners.get(type) ?? new Set()
        typeListeners.add(listener)
        listeners.set(type, typeListeners)
      }),
      emit: (type: string, payload: unknown) => {
        listeners.get(type)?.forEach(listener => listener(payload))
      },
      clear: () => {
        listeners.clear()
      }
    }
  }
})

vi.mock('/@/lib/apis', () => ({
  default: {
    getOnlineUsers: mockGetOnlineUsers
  }
}))

vi.mock('/@/lib/websocket', () => ({
  wsListener: mockWsListener
}))

describe('onlineUsers store', () => {
  beforeEach(() => {
    mockGetOnlineUsers.mockReset()
    mockWsListener.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('preserves websocket updates received during an HTTP fetch', async () => {
    vi.useFakeTimers()
    const initiallyOnline = '11111111-1111-4111-8111-111111111111' as UserId
    const becameOnline = '22222222-2222-4222-8222-222222222222' as UserId
    const stayedOnline = '33333333-3333-4333-8333-333333333333' as UserId
    const onlineAt = new Date('2030-01-02T03:04:00Z')
    const offlineAt = new Date('2030-01-02T03:05:00Z')
    const fetchedAt = new Date('2030-01-02T03:06:00Z')
    let resolveFetch!: (response: { data: UserId[] }) => void
    mockGetOnlineUsers.mockReturnValueOnce(
      new Promise(resolve => {
        resolveFetch = resolve
      })
    )

    const pinia = createPinia()
    setActivePinia(pinia)
    const { fetchOnlineUsers, lastOnlineAt, onlineUsers } =
      useOnlineUsers(pinia)
    const fetch = fetchOnlineUsers()

    vi.setSystemTime(onlineAt)
    mockWsListener.emit('USER_ONLINE', { id: becameOnline })
    vi.setSystemTime(offlineAt)
    mockWsListener.emit('USER_OFFLINE', { id: initiallyOnline })
    vi.setSystemTime(fetchedAt)
    resolveFetch({ data: [initiallyOnline, stayedOnline] })

    await expect(fetch).resolves.toEqual(new Set([becameOnline, stayedOnline]))
    expect(onlineUsers.value).toEqual(new Set([becameOnline, stayedOnline]))
    expect(lastOnlineAt.value).toEqual(
      new Map([
        [initiallyOnline, offlineAt.toISOString()],
        [stayedOnline, fetchedAt.toISOString()],
        [becameOnline, onlineAt.toISOString()]
      ])
    )
  })

  it('fetches a fresh snapshot after reconnecting during a fetch', async () => {
    const staleUser = '11111111-1111-4111-8111-111111111111' as UserId
    const currentUser = '22222222-2222-4222-8222-222222222222' as UserId
    let resolveInitialFetch!: (response: { data: UserId[] }) => void
    let resolveReconnectFetch!: (response: { data: UserId[] }) => void
    mockGetOnlineUsers
      .mockReturnValueOnce(
        new Promise(resolve => {
          resolveInitialFetch = resolve
        })
      )
      .mockReturnValueOnce(
        new Promise(resolve => {
          resolveReconnectFetch = resolve
        })
      )

    const pinia = createPinia()
    setActivePinia(pinia)
    const { fetchOnlineUsers, lastOnlineAt, onlineUsers } =
      useOnlineUsers(pinia)
    const initialFetch = fetchOnlineUsers()

    mockWsListener.emit('reconnect', undefined)
    expect(mockGetOnlineUsers).toHaveBeenCalledOnce()

    resolveInitialFetch({ data: [staleUser] })
    await initialFetch
    await vi.waitFor(() => expect(mockGetOnlineUsers).toHaveBeenCalledTimes(2))

    resolveReconnectFetch({ data: [currentUser] })
    await vi.waitFor(() =>
      expect(onlineUsers.value).toEqual(new Set([currentUser]))
    )
    expect(lastOnlineAt.value.has(currentUser)).toBe(true)
    await expect(fetchOnlineUsers()).resolves.toEqual(new Set([currentUser]))
    expect(mockGetOnlineUsers).toHaveBeenCalledTimes(2)
  })

  it('preserves an offline timestamp across a refresh', async () => {
    vi.useFakeTimers()
    const userId = '11111111-1111-4111-8111-111111111111' as UserId
    const onlineAt = new Date('2030-01-02T03:04:00Z')
    const offlineAt = new Date('2030-01-02T03:05:00Z')
    mockGetOnlineUsers
      .mockResolvedValueOnce({ data: [userId] })
      .mockResolvedValueOnce({ data: [] })

    vi.setSystemTime(onlineAt)
    const pinia = createPinia()
    setActivePinia(pinia)
    const { fetchOnlineUsers, lastOnlineAt } = useOnlineUsers(pinia)
    await fetchOnlineUsers()

    vi.setSystemTime(offlineAt)
    mockWsListener.emit('USER_OFFLINE', { id: userId })
    await fetchOnlineUsers({ ignoreCache: true })

    expect(lastOnlineAt.value.get(userId)).toBe(offlineAt.toISOString())
  })

  it('updates online timestamps when the server answers ping', async () => {
    vi.useFakeTimers()
    const userId = '11111111-1111-4111-8111-111111111111' as UserId
    const fetchedAt = new Date('2030-01-02T03:04:00Z')
    const pingedAt = new Date('2030-01-02T03:05:00Z')
    mockGetOnlineUsers.mockResolvedValueOnce({ data: [userId] })

    vi.setSystemTime(fetchedAt)
    const pinia = createPinia()
    setActivePinia(pinia)
    const { fetchOnlineUsers, lastOnlineAt } = useOnlineUsers(pinia)
    await fetchOnlineUsers()
    expect(lastOnlineAt.value.get(userId)).toBe(fetchedAt.toISOString())

    vi.setSystemTime(pingedAt)
    mockWsListener.emit('PING', null)
    expect(lastOnlineAt.value.get(userId)).toBe(pingedAt.toISOString())
  })
})
