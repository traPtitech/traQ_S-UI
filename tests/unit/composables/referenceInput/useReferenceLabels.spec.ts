import { computed } from 'vue'

import useReferenceLabels from '/@/composables/referenceInput/useReferenceLabels'
import useChannelPath from '/@/composables/useChannelPath'
import { type Reference, encodeReference } from '/@/lib/references'
import { useChannelsStore } from '/@/store/entities/channels'
import { useGroupsStore } from '/@/store/entities/groups'
import { useUsersStore } from '/@/store/entities/users'

import {
  createChannel,
  createUser,
  createUserGroup
} from '../../fixtures/entities'
import { resetReferenceEntities } from '../../fixtures/referenceEntities'

await vi.hoisted(async () => {
  await import('../../fixtures/referenceEntities')
})

beforeEach(resetReferenceEntities)

it('uses fetched state, hash prefixes, nested paths and DM names from the real resolver', () => {
  const channels = useChannelsStore()
  channels.channelsMap.value.set(
    'parent',
    createChannel({ id: 'parent', name: 'team', children: ['child'] })
  )
  channels.channelsMap.value.set(
    'child',
    createChannel({ id: 'child', name: 'work', parentId: 'parent' })
  )
  channels.dmChannelsMap.value.set('dm', { id: 'dm', userId: 'user-id' })
  useUsersStore().usersMap.value.set('user-id', createUser())

  const { channelIdToPathString, channelPathStringToId } = useChannelPath()
  channels.bothChannelsMapFetched.value = false
  expect(channelIdToPathString('child', true)).toBeNull()
  channels.bothChannelsMapFetched.value = true
  expect(channelIdToPathString('child')).toBe('team/work')
  expect(channelIdToPathString('child', true)).toBe('#team/work')
  expect(channelPathStringToId('team/work')).toBe('child')
  expect(channelIdToPathString('dm')).toBe('alice')
  expect(channelIdToPathString('dm', true)).toBe('@alice')

  channels.channelsMap.value.set(
    'child',
    createChannel({ id: 'child', name: 'renamed', parentId: 'parent' })
  )
  expect(channelPathStringToId('team/renamed')).toBe('child')
  expect(channelIdToPathString('child', true)).toBe('#team/renamed')
})

describe('reference labels shared by inputs and history', () => {
  it('reacts to renamed users in a persisted search without changing the saved query', () => {
    const { usersMap } = useUsersStore()
    usersMap.value.set('user-id', createUser({ id: 'user-id', name: 'alice' }))

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

    usersMap.value.set(
      'user-id',
      createUser({ id: 'user-id', name: 'renamed' })
    )

    expect(displayed.value).toBe('topic from:@renamed')

    usersMap.value.clear()

    expect(displayed.value).toBe('topic from:@old')
    expect(source).toContain('"id":"user-id"')
  })

  it('uses the explicit group kind instead of guessing from users', () => {
    useUsersStore().usersMap.value.set(
      'same-id',
      createUser({
        name: 'wrong-user'
      })
    )

    useGroupsStore().userGroupsMap.value.set(
      'same-id',
      createUserGroup({
        name: 'team'
      })
    )

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
    useChannelsStore().channelsMap.value.set(
      'channel-id',
      createChannel({
        id: 'channel-id',
        name: 'new-path'
      })
    )

    expect(useReferenceLabels().label(reference)).toBe(
      `${reference.type === 'search-in' ? 'in:' : ''}#new-path`
    )
  })

  it('looks up a DM channel through its user without changing the channel ID', () => {
    useChannelsStore().dmChannelsMap.value.set('dm-id', {
      id: 'dm-id',
      userId: 'user-id'
    })

    useUsersStore().usersMap.value.set('user-id', createUser({ name: 'alice' }))

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
