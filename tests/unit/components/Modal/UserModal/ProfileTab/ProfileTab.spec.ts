import type { User, UserDetail } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'

import { nextTick, ref } from 'vue'

import { enableAutoUnmount, shallowMount } from '@vue/test-utils'

import LastOnline from '/@/components/Modal/UserModal/ProfileTab/LastOnline.vue'
import ProfileTab from '/@/components/Modal/UserModal/ProfileTab/ProfileTab.vue'
import { getFullDayWithTimeString } from '/@/lib/basic/date'
import type { UserId } from '/@/types/entity-ids'

const { mockFetchOnlineUsers } = vi.hoisted(() => ({
  mockFetchOnlineUsers: vi.fn()
}))

const lastOnlineAt = ref(new Map<UserId, string>())
const onlineUsers = ref(new Set<UserId>())
const onlineUsersFetched = ref(false)

vi.mock('/@/store/domain/onlineUsers', () => ({
  useOnlineUsers: () => ({
    lastOnlineAt,
    onlineUsers,
    onlineUsersFetched,
    fetchOnlineUsers: mockFetchOnlineUsers
  })
}))

const user: User = {
  id: 'user',
  name: 'user',
  displayName: 'User',
  iconFileId: '',
  state: UserAccountState.active,
  bot: false,
  updatedAt: '2026-09-21T00:00:00Z'
}

const detail: UserDetail = {
  ...user,
  twitterId: '',
  lastOnline: null,
  tags: [],
  groups: [],
  bio: '',
  homeChannel: null
}

const earlier = '2026-09-21T10:05:00Z'
const later = '2026-09-21T10:15:00Z'

const mountProfile = (lastOnline?: string | null) =>
  shallowMount(ProfileTab, {
    props: {
      user,
      detail: lastOnline === undefined ? undefined : { ...detail, lastOnline }
    },
    global: { stubs: { LastOnline: false } }
  })

enableAutoUnmount(afterEach)

describe('ProfileTab', () => {
  beforeEach(() => {
    lastOnlineAt.value = new Map()
    onlineUsers.value = new Set()
    onlineUsersFetched.value = true
    mockFetchOnlineUsers.mockReset().mockResolvedValue(new Set())
  })

  it.each([
    [
      'uses newer user details after a missed offline event',
      earlier,
      later,
      later
    ],
    ['uses a newer offline event than the user details', later, earlier, later],
    ['uses the user details without an offline event', undefined, later, later],
    [
      'uses the offline event without a timestamp in user details',
      later,
      null,
      later
    ],
    [
      'compares timestamps with different time zones',
      '2026-09-21T10:05:00.000Z',
      '2026-09-21T12:00:00+09:00',
      '2026-09-21T10:05:00.000Z'
    ]
  ])('%s', (_name, eventLastOnline, serverLastOnline, expected) => {
    if (eventLastOnline) lastOnlineAt.value.set(user.id, eventLastOnline)

    const wrapper = mountProfile(serverLastOnline)

    expect(wrapper.getComponent(LastOnline).get('p').text()).toBe(
      getFullDayWithTimeString(new Date(expected))
    )
  })

  it.each([null, undefined])(
    'hides the section without a timestamp (%s)',
    lastOnline => {
      const wrapper = mountProfile(lastOnline)

      expect(wrapper.findComponent(LastOnline).exists()).toBe(false)
    }
  )

  it.each([false, true])(
    'waits for the initial online status (online: %s)',
    async isOnline => {
      onlineUsersFetched.value = false
      const wrapper = mountProfile(earlier)

      expect(wrapper.findComponent(LastOnline).exists()).toBe(false)

      if (isOnline) onlineUsers.value.add(user.id)
      onlineUsersFetched.value = true
      await nextTick()

      expect(wrapper.findComponent(LastOnline).exists()).toBe(!isOnline)
    }
  )

  it('updates the timestamp when newer user details arrive', async () => {
    lastOnlineAt.value.set(user.id, earlier)
    const wrapper = mountProfile()

    expect(mockFetchOnlineUsers).toHaveBeenCalledOnce()
    expect(wrapper.getComponent(LastOnline).get('p').text()).toBe(
      getFullDayWithTimeString(new Date(earlier))
    )

    await wrapper.setProps({ detail: { ...detail, lastOnline: later } })

    expect(wrapper.getComponent(LastOnline).get('p').text()).toBe(
      getFullDayWithTimeString(new Date(later))
    )
  })

  it('hides the section while the user is online', () => {
    onlineUsers.value.add(user.id)
    lastOnlineAt.value.set(user.id, earlier)
    const wrapper = mountProfile(later)

    expect(wrapper.findComponent(LastOnline).exists()).toBe(false)
  })

  it('shows the server timestamp when the user goes offline', async () => {
    onlineUsers.value.add(user.id)
    const wrapper = mountProfile(earlier)

    expect(wrapper.findComponent(LastOnline).exists()).toBe(false)

    onlineUsers.value.delete(user.id)
    lastOnlineAt.value.set(user.id, later)
    await nextTick()

    expect(wrapper.getComponent(LastOnline).get('p').text()).toBe(
      getFullDayWithTimeString(new Date(later))
    )
  })

  it('hides the section when the user comes online', async () => {
    const wrapper = mountProfile(earlier)

    expect(wrapper.findComponent(LastOnline).exists()).toBe(true)

    onlineUsers.value.add(user.id)
    await nextTick()

    expect(wrapper.findComponent(LastOnline).exists()).toBe(false)
  })
})
