import type { User, UserDetail } from '@traptitech/traq'
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
      createUser('deactivated-user', UserAccountState.deactivated),
      createUser('suspended-user', UserAccountState.suspended)
    ]
    mockGetUsers.mockResolvedValue({ data: users })

    const { fetchUsers, usersMap } = useUsersStore()
    await fetchUsers()

    expect(mockGetUsers).toHaveBeenCalledOnce()
    expect(mockGetUsers).toHaveBeenCalledWith(true)
    expect([...usersMap.value.values()]).toEqual(users)
  })

  describe('user detail', () => {
    // convertToRefsStore は引数なしの呼び出しの結果を使い回すので、テストごとに pinia を渡す
    const setupStore = () => useUsersStore(createPinia())

    it('stores the fetched detail in both maps', async () => {
      const detail = createUserDetail('user')
      mockGetUser.mockResolvedValue({ data: detail })

      const { fetchUserDetail, userDetailsMap, usersMap } = setupStore()
      const res = await fetchUserDetail({ userId: 'user' })

      expect(res).toEqual(detail)
      expect(mockGetUser).toHaveBeenCalledWith('user')
      expect(userDetailsMap.value.get('user')).toEqual(detail)
      expect(usersMap.value.get('user')).toEqual(detail)
    })

    it('returns the cached detail without requesting with useCache', async () => {
      mockGetUser.mockResolvedValue({ data: createUserDetail('user') })

      const { fetchUserDetail } = setupStore()
      await fetchUserDetail({ userId: 'user' })
      await fetchUserDetail({ userId: 'user', cacheStrategy: 'useCache' })

      expect(mockGetUser).toHaveBeenCalledOnce()
    })

    it('requests again and replaces the cache with forceFetch', async () => {
      mockGetUser
        .mockResolvedValueOnce({ data: createUserDetail('user', 'old bio') })
        .mockResolvedValueOnce({ data: createUserDetail('user', 'new bio') })

      const { fetchUserDetail, userDetailsMap } = setupStore()
      await fetchUserDetail({ userId: 'user' })
      await fetchUserDetail({ userId: 'user', cacheStrategy: 'forceFetch' })

      expect(mockGetUser).toHaveBeenCalledTimes(2)
      expect(userDetailsMap.value.get('user')?.bio).toBe('new bio')
    })

    it('shares a request between fetchUser and fetchUserDetail', async () => {
      const detail = createUserDetail('user')
      let resolve!: (value: { data: UserDetail }) => void
      mockGetUser.mockReturnValue(
        new Promise(res => {
          resolve = res
        })
      )

      const { fetchUser, fetchUserDetail, userDetailsMap } = setupStore()
      const userPromise = fetchUser({
        userId: 'user',
        cacheStrategy: 'forceFetch'
      })
      const detailPromise = fetchUserDetail({
        userId: 'user',
        cacheStrategy: 'forceFetch'
      })
      resolve({ data: detail })
      await Promise.all([userPromise, detailPromise])

      expect(mockGetUser).toHaveBeenCalledOnce()
      expect(userDetailsMap.value.get('user')).toEqual(detail)
    })

    it('updates the cached detail on USER_UPDATED', async () => {
      mockGetUser
        .mockResolvedValueOnce({ data: createUserDetail('user', 'old bio') })
        .mockResolvedValueOnce({ data: createUserDetail('user', 'new bio') })

      const { fetchUserDetail, userDetailsMap } = setupStore()
      await fetchUserDetail({ userId: 'user' })
      getWsHandler('USER_UPDATED')({ id: 'user' })

      await vi.waitFor(() => {
        expect(userDetailsMap.value.get('user')?.bio).toBe('new bio')
      })
    })

    it('refetches the detail on USER_TAGS_UPDATED only for cached users', async () => {
      mockGetUser.mockResolvedValue({ data: createUserDetail('user') })

      const { fetchUserDetail } = setupStore()
      await fetchUserDetail({ userId: 'user' })
      mockGetUser.mockClear()

      const handler = getWsHandler('USER_TAGS_UPDATED')
      handler({ id: 'other-user', tag_id: 'tag' })
      expect(mockGetUser).not.toHaveBeenCalled()

      handler({ id: 'user', tag_id: 'tag' })
      expect(mockGetUser).toHaveBeenCalledOnce()
      expect(mockGetUser).toHaveBeenCalledWith('user')
    })

    it('updates lastOnline on USER_OFFLINE without requesting', async () => {
      mockGetUser.mockResolvedValue({ data: createUserDetail('user') })

      const { fetchUserDetail, userDetailsMap } = setupStore()
      await fetchUserDetail({ userId: 'user' })
      mockGetUser.mockClear()

      getWsHandler('USER_OFFLINE')({
        id: 'user',
        last_online: '2026-02-01T00:00:00Z'
      })

      expect(mockGetUser).not.toHaveBeenCalled()
      expect(userDetailsMap.value.get('user')?.lastOnline).toBe(
        '2026-02-01T00:00:00Z'
      )
    })

    it('deletes the cached detail on USER_LEFT', async () => {
      mockGetUser.mockResolvedValue({ data: createUserDetail('user') })

      const { fetchUserDetail, userDetailsMap } = setupStore()
      await fetchUserDetail({ userId: 'user' })
      getWsHandler('USER_LEFT')({ id: 'user' })

      expect(userDetailsMap.value.has('user')).toBe(false)
    })
  })
})

const getWsHandler = (eventName: string) => {
  const call = mockWsOn.mock.calls.find(([name]) => name === eventName)
  if (!call) throw new Error(`${eventName} handler is not registered`)
  return call[1] as (payload: unknown) => void
}

const createUser = (id: string, state: UserAccountState): User => ({
  id,
  name: id,
  displayName: id,
  iconFileId: `${id}-icon`,
  state,
  bot: false,
  updatedAt: '2026-01-01T00:00:00Z'
})

const createUserDetail = (id: string, bio = `${id} bio`): UserDetail => ({
  ...createUser(id, UserAccountState.active),
  twitterId: '',
  lastOnline: '2026-01-01T00:00:00Z',
  tags: [],
  groups: [],
  bio,
  homeChannel: null
})
