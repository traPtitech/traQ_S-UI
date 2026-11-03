import type { Channel, User, UserGroup } from '@traptitech/traq'

import { computed } from 'vue'

import useReferenceLabels from '/@/composables/referenceInput/useReferenceLabels'
import { type Reference, encodeReference } from '/@/lib/references'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'

vi.mock('/@/store/entities/users', async () => {
  const { ref } = await import('vue')
  const usersMap = ref(new Map())

  return { useUsersStore: () => ({ usersMap }) }
})

vi.mock('/@/store/entities/groups', async () => {
  const { ref } = await import('vue')
  const userGroupsMap = ref(new Map())

  return { useGroupsStore: () => ({ userGroupsMap }) }
})

vi.mock('/@/store/entities/channels', async () => {
  const { ref } = await import('vue')

  const channelsMap = ref(new Map()),
    dmChannelsMap = ref(new Map())

  return { useChannelsStore: () => ({ channelsMap, dmChannelsMap }) }
})

vi.mock('/@/composables/useChannelPath', async () => {
  const { useChannelsStore } = await import('/@/store/entities/channels')

  return {
    default: () => ({
      channelIdToPathString: (id: string) =>
        `#${useChannelsStore().channelsMap.value.get(id)?.name}`
    })
  }
})

beforeEach(() => {
  useUsersStore().usersMap.value.clear()
  useGroupsStore().userGroupsMap.value.clear()
  useChannelsStore().channelsMap.value.clear()
  useChannelsStore().dmChannelsMap.value.clear()
})

describe('reference labels shared by inputs and history', () => {
  it('reacts to renamed users in a persisted search without changing the saved query', () => {
    const { usersMap } = useUsersStore()
    usersMap.value.set('user-id', { id: 'user-id', name: 'alice' } as User)

    const reference = {
      type: 'search-from',
      id: 'user-id',
      raw: 'from:@old',
      kind: 'user'
    } as const

    const source = `topic ${encodeReference(reference)}`
    const { label, displayInput } = useReferenceLabels()
    const displayed = computed(() => displayInput(source, 'search'))

    expect(displayed.value).toBe(`topic ${label(reference)}`)

    usersMap.value.set('user-id', { id: 'user-id', name: 'renamed' } as User)

    expect(displayed.value).toBe('topic from:@renamed')

    usersMap.value.clear()

    expect(displayed.value).toBe('topic from:@old')
    expect(source).toContain('"id":"user-id"')
  })

  it('uses the explicit group kind instead of guessing from users', () => {
    useUsersStore().usersMap.value.set('same-id', {
      name: 'wrong-user'
    } as User)

    useGroupsStore().userGroupsMap.value.set('same-id', {
      name: 'team'
    } as UserGroup)

    expect(
      useReferenceLabels().label({
        type: 'search-to',
        id: 'same-id',
        raw: 'to:@old',
        kind: 'group'
      })
    ).toBe('to:@team')
  })

  it.each([
    { type: 'channel', id: 'channel-id', raw: '#old' },
    { type: 'search-in', id: 'channel-id', raw: 'in:#old', kind: 'channel' }
  ] satisfies Reference[])('resolves a channel path for %j', reference => {
    useChannelsStore().channelsMap.value.set('channel-id', {
      id: 'channel-id',
      name: 'new-path'
    } as Channel)

    expect(useReferenceLabels().label(reference)).toBe(
      `${reference.type === 'search-in' ? 'in:' : ''}#new-path`
    )
  })

  it('looks up a DM channel through its user without changing the channel ID', () => {
    useChannelsStore().dmChannelsMap.value.set('dm-id', {
      id: 'dm-id',
      userId: 'user-id'
    })

    useUsersStore().usersMap.value.set('user-id', { name: 'alice' } as User)

    expect(
      useReferenceLabels().label({
        type: 'search-in',
        id: 'dm-id',
        raw: 'in:@old',
        kind: 'dm'
      })
    ).toBe('in:@alice')
  })
})
