import { AxiosError, AxiosHeaders } from 'axios'
import { createPinia, setActivePinia } from 'pinia'

import useChannelPath from '/@/composables/useChannelPath'
import apis from '/@/lib/apis'
import { useChannelsStore } from '/@/store/entities/channels'
import { useThreadsStore } from '/@/store/entities/threads'

const parentId = '10000000-0000-4000-8000-000000000001'
const threadId = '10000000-0000-4000-8000-000000000002'
const parent = {
  id: parentId,
  name: 'general',
  parentId: null,
  parentMessageId: null,
  archived: false,
  force: false,
  topic: '',
  children: []
}
const response = (name = 'discussion') => ({
  data: { ...parent, id: threadId, parentId, parentMessageId: 'message', name },
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() }
})
beforeEach(() => {
  setActivePinia(createPinia())
  useThreadsStore().threadsMap.value.clear()
  const { channelsMap, bothChannelsMapFetched } = useChannelsStore()
  channelsMap.value = new Map([[parentId, parent]])
  bothChannelsMapFetched.value = true
  vi.spyOn(apis, 'getChannel').mockResolvedValue(response())
})
afterEach(() => vi.restoreAllMocks())

test('all path conversions are synchronous and use the fetched thread', async () => {
  await useThreadsStore().fetchThread(threadId)
  const paths = useChannelPath()
  expect(paths.channelIdToPath(threadId)).toEqual(['general', 'discussion'])
  expect(paths.channelIdToPathString(threadId, true)).toBe(
    '#general/discussion'
  )
  expect(paths.channelIdToShortPathString(threadId)).toBe('general/discussion')
  expect(paths.channelIdToLink(threadId)).toBe(`/channels/general/${threadId}`)
  expect(apis.getChannel).toHaveBeenCalledTimes(1)
  expect(useChannelsStore().channelsMap.value.has(threadId)).toBe(false)
})
test('shares concurrent requests and cached reads, but refreshes on force', async () => {
  const { fetchThread } = useThreadsStore()
  await Promise.all([fetchThread(threadId), fetchThread(threadId)])
  await fetchThread(threadId)
  expect(apis.getChannel).toHaveBeenCalledTimes(1)
  vi.mocked(apis.getChannel).mockResolvedValue(response('renamed'))
  await fetchThread(threadId, { force: true })
  expect(useChannelPath().channelIdToShortPathString(threadId)).toBe(
    'general/renamed'
  )
  expect(apis.getChannel).toHaveBeenCalledTimes(2)
})
test('missing threads do not trigger communication during conversion', () => {
  const paths = useChannelPath()
  expect(paths.channelIdToPath(threadId)).toBeNull()
  expect(paths.channelIdToShortPathString(threadId)).toBeNull()
  expect(paths.channelIdToLink(threadId)).toBeNull()
  expect(apis.getChannel).not.toHaveBeenCalled()
})
test('removes a thread on 404 but preserves it on network failure', async () => {
  const { fetchThread, threadsMap } = useThreadsStore()
  await fetchThread(threadId)
  vi.mocked(apis.getChannel).mockRejectedValueOnce(new Error('offline'))
  await expect(fetchThread(threadId, { force: true })).rejects.toThrow(
    'offline'
  )
  expect(threadsMap.value.has(threadId)).toBe(true)
  const error = new AxiosError('not found')
  error.response = { ...response(), status: 404 }
  vi.mocked(apis.getChannel).mockRejectedValueOnce(error)
  expect(await fetchThread(threadId, { force: true })).toBeUndefined()
  expect(threadsMap.value.has(threadId)).toBe(false)
})
