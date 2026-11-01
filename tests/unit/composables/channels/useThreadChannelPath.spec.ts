import type { Channel } from '@traptitech/traq'
import { UserAccountState } from '@traptitech/traq'

import { createTestingPinia } from '@pinia/testing'
import { AxiosHeaders } from 'axios'

import useChannelPath from '/@/composables/useChannelPath'
import apis from '/@/lib/apis'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'

describe('thread channel paths', () => {
  const rootId = '10000000-0000-4000-8000-000000000001'
  const parentId = '10000000-0000-4000-8000-000000000002'
  const threadId = '10000000-0000-4000-8000-000000000003'

  const makeChannel = (
    id: string,
    name: string,
    parentId: string | null
  ): Channel => ({
    id,
    name,
    parentId,
    archived: false,
    force: false,
    topic: '',
    children: []
  })
  const response = (
    name = 'discussion',
    parentMessageId: string | null = 'parent-message'
  ) => ({
    data: { ...makeChannel(threadId, name, parentId), parentMessageId },
    status: 200,
    statusText: 'OK',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() }
  })

  beforeEach(() => {
    createTestingPinia()
    const { channelsMap, bothChannelsMapFetched } = useChannelsStore()
    channelsMap.value = new Map([
      [rootId, { ...makeChannel(rootId, 'team', null), children: [parentId] }],
      [parentId, makeChannel(parentId, 'general', rootId)]
    ])
    bothChannelsMapFetched.value = true
    vi.spyOn(apis, 'getChannel').mockResolvedValue(response())
  })

  afterEach(() => vi.restoreAllMocks())

  test('builds the ancestor path followed by the thread name', async () => {
    const {
      channelIdToSimpleChannelPath,
      channelIdToPath,
      channelIdToPathString
    } = useChannelPath()
    expect(await channelIdToSimpleChannelPath(threadId)).toEqual([
      { id: rootId, name: 'team' },
      { id: parentId, name: 'general' },
      { id: threadId, name: 'discussion' }
    ])
    expect(await channelIdToPath(threadId)).toEqual([
      'team',
      'general',
      'discussion'
    ])
    expect(await channelIdToPathString(threadId)).toBe(
      'team/general/discussion'
    )
    expect(await channelIdToPathString(threadId, true)).toBe(
      '#team/general/discussion'
    )
    expect(apis.getChannel).toHaveBeenCalledTimes(4)
  })

  test('uses the name for shortened display and UUID for navigation', async () => {
    const { channelIdToShortPathString, channelIdToLink } = useChannelPath()
    expect(await channelIdToShortPathString(threadId, true)).toBe(
      '#t/general/discussion'
    )
    expect(await channelIdToLink(threadId)).toBe(
      `/channels/team/general/${threadId}`
    )
    expect(apis.getChannel).toHaveBeenCalledTimes(2)
  })

  test('fetches each time and observes renames and deletion without storing the thread', async () => {
    vi.mocked(apis.getChannel)
      .mockResolvedValueOnce(response('first'))
      .mockResolvedValueOnce(response('renamed'))
      .mockRejectedValueOnce(new Error('not found'))
    const { channelIdToShortPathString } = useChannelPath()
    expect(await channelIdToShortPathString(threadId)).toBe('t/general/first')
    expect(await channelIdToShortPathString(threadId)).toBe('t/general/renamed')
    expect(await channelIdToShortPathString(threadId)).toBeNull()
    expect(apis.getChannel).toHaveBeenCalledTimes(3)
    expect(useChannelsStore().channelsMap.value.has(threadId)).toBe(false)
    expect(useChannelsStore().dmChannelsMap.value.has(threadId)).toBe(false)
  })

  test.each([undefined, null, ''])(
    'does not treat an ordinary channel as a thread (%s)',
    async parentMessageId => {
      const data = { ...response().data, parentMessageId }
      vi.mocked(apis.getChannel).mockResolvedValue({
        ...response(),
        data
      })
      expect(await useChannelPath().channelIdToPath(threadId)).toBeNull()
    }
  )

  test('returns null if the parent channel is unavailable', async () => {
    useChannelsStore().channelsMap.value.delete(parentId)
    expect(await useChannelPath().channelIdToPathString(threadId)).toBeNull()
  })

  test('does not fetch ordinary channel paths or links', async () => {
    const {
      channelIdToPath,
      channelIdToPathString,
      channelIdToShortPathString,
      channelIdToLink
    } = useChannelPath()
    expect(await channelIdToPath(parentId)).toEqual(['team', 'general'])
    expect(await channelIdToPathString(parentId, true)).toBe('#team/general')
    expect(await channelIdToShortPathString(parentId)).toBe('t/general')
    expect(await channelIdToLink(parentId)).toBe('/channels/team/general')
    expect(apis.getChannel).not.toHaveBeenCalled()
  })

  test('keeps DM display and links without fetching the channel', async () => {
    const { dmChannelsMap } = useChannelsStore()
    dmChannelsMap.value.set(threadId, { id: threadId, userId: 'user-id' })
    useUsersStore().usersMap.value.set('user-id', {
      id: 'user-id',
      name: 'alice',
      displayName: 'Alice',
      iconFileId: '',
      state: UserAccountState.active,
      bot: false,
      updatedAt: '2026-01-01T00:00:00Z'
    })
    const {
      channelIdToPath,
      channelIdToPathString,
      channelIdToShortPathString,
      channelIdToLink
    } = useChannelPath()
    expect(await channelIdToPath(threadId)).toEqual(['alice'])
    expect(await channelIdToPathString(threadId, true)).toBe('@alice')
    expect(await channelIdToShortPathString(threadId)).toBe('alice')
    expect(await channelIdToLink(threadId)).toBe('/users/alice')
    expect(apis.getChannel).not.toHaveBeenCalled()
  })

  test('does not request malformed IDs', async () => {
    expect(await useChannelPath().channelIdToPath('invalid')).toBeNull()
    expect(apis.getChannel).not.toHaveBeenCalled()
  })
})
