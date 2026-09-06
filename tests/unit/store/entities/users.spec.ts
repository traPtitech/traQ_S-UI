import type { User } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'

import { createPinia, setActivePinia } from 'pinia'

import { useUsersStore } from '/@/store/entities/users'

const { mockGetUser, mockGetUsers, mockWsOn } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetUsers: vi.fn(),
  mockWsOn: vi.fn()
}))

vi.mock('/@/lib/apis', () => ({
  default: {
    getUser: mockGetUser,
    getUsers: mockGetUsers
  }
}))

vi.mock('/@/lib/websocket', () => ({
  wsListener: { on: mockWsOn }
}))

describe('useUsersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('includes suspended users in the initial user cache', async () => {
    const users = [
      createUser('active-user', UserAccountState.active),
      createUser('suspended-user', UserAccountState.suspended)
    ]
    mockGetUsers.mockResolvedValue({ data: users })

    const { fetchUsers, usersMap } = useUsersStore()
    await fetchUsers()

    expect(mockGetUsers).toHaveBeenCalledOnce()
    expect(mockGetUsers).toHaveBeenCalledWith(true)
    expect([...usersMap.value.values()]).toEqual(users)
  })
})

const createUser = (id: string, state: UserAccountState): User => ({
  id,
  name: id,
  displayName: id,
  iconFileId: `${id}-icon`,
  state,
  bot: false,
  updatedAt: '2026-01-01T00:00:00Z'
})
