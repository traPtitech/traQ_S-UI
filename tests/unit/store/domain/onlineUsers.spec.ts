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

  it('preserves websocket updates received during an HTTP fetch', async () => {
    const initiallyOnline = '11111111-1111-4111-8111-111111111111' as UserId
    const becameOnline = '22222222-2222-4222-8222-222222222222' as UserId
    let resolveFetch!: (response: { data: UserId[] }) => void
    mockGetOnlineUsers.mockReturnValueOnce(
      new Promise(resolve => {
        resolveFetch = resolve
      })
    )

    const pinia = createPinia()
    setActivePinia(pinia)
    const { fetchOnlineUsers, onlineUsers } = useOnlineUsers(pinia)
    const fetch = fetchOnlineUsers()

    mockWsListener.emit('USER_ONLINE', { id: becameOnline })
    mockWsListener.emit('USER_OFFLINE', { id: initiallyOnline })
    resolveFetch({ data: [initiallyOnline] })

    await expect(fetch).resolves.toEqual(new Set([becameOnline]))
    expect(onlineUsers.value).toEqual(new Set([becameOnline]))
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
    const { fetchOnlineUsers, onlineUsers } = useOnlineUsers(pinia)
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
    await expect(fetchOnlineUsers()).resolves.toEqual(new Set([currentUser]))
    expect(mockGetOnlineUsers).toHaveBeenCalledTimes(2)
  })
})
