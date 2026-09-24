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

vi.mock('/@/store/domain/onlineUsers', () => ({
  useOnlineUsers: () => ({
    lastOnlineAt,
    onlineUsers,
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
    ['shows no timestamp when both are missing', undefined, null, undefined],
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
      expected ? getFullDayWithTimeString(new Date(expected)) : ''
    )
  })

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

  it('shows online status instead of a historical timestamp', () => {
    onlineUsers.value.add(user.id)
    lastOnlineAt.value.set(user.id, earlier)
    const wrapper = mountProfile(later)

    expect(wrapper.getComponent(LastOnline).get('p').text()).toBe(
      'オンライン中'
    )
  })

  it('shows the server timestamp when the user goes offline', async () => {
    onlineUsers.value.add(user.id)
    const wrapper = mountProfile(earlier)

    expect(wrapper.getComponent(LastOnline).get('p').text()).toBe(
      'オンライン中'
    )

    onlineUsers.value.delete(user.id)
    lastOnlineAt.value.set(user.id, later)
    await nextTick()

    expect(wrapper.getComponent(LastOnline).get('p').text()).toBe(
      getFullDayWithTimeString(new Date(later))
    )
  })
})
