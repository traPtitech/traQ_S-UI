import { effectScope, reactive, ref } from 'vue'

import { flushPromises } from '@vue/test-utils'

import useRouteWatcher from '/@/views/composables/useRouteWatcher'

const mocks = vi.hoisted(() => ({
  route: {} as Record<string, unknown>,
  channels: {} as Record<string, unknown>,
  getChannel: vi.fn(),
  replace: vi.fn(),
  channelPathStringToId: vi.fn(),
  channelIdToPathString: vi.fn(),
  changePrimaryViewToChannel: vi.fn(),
  changePrimaryViewToThread: vi.fn()
}))

vi.mock('vue-router', () => ({ useRoute: () => mocks.route }))
vi.mock('/@/router', () => ({
  default: { replace: mocks.replace },
  RouteName: { Channel: 'channel' },
  constructChannelPath: (path: string) => `/channels/${path}`
}))
vi.mock('/@/lib/apis', () => ({
  default: { getChannel: mocks.getChannel }
}))
vi.mock('/@/composables/dom/useRenderKey', () => ({ useRenderKey: vi.fn() }))
vi.mock('/@/composables/mainView/useNavigationController', () => ({
  default: () => ({ closeNav: vi.fn() })
}))
vi.mock('/@/composables/useChannelPath', () => ({
  default: () => ({
    channelPathStringToId: mocks.channelPathStringToId,
    channelIdToPathString: mocks.channelIdToPathString
  })
}))
vi.mock('/@/store/app/browserSettings', () => ({
  useBrowserSettings: () => ({ getStartupChannelPath: async () => 'general' })
}))
vi.mock('/@/store/domain/channelTree', () => ({
  useChannelTree: () => ({ channelTree: { value: { children: [{}] } } })
}))
vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => mocks.channels
}))
vi.mock('/@/store/entities/clipFolders', () => ({
  useClipFoldersStore: () => ({})
}))
vi.mock('/@/store/entities/messages', () => ({ useMessagesStore: () => ({}) }))
vi.mock('/@/store/entities/users', () => ({ useUsersStore: () => ({}) }))
vi.mock('/@/store/ui/mainView', () => ({
  useMainViewStore: () => ({
    changePrimaryViewToChannel: mocks.changePrimaryViewToChannel,
    changePrimaryViewToThread: mocks.changePrimaryViewToThread
  })
}))
vi.mock('/@/store/ui/modal', () => ({
  useModalStore: () => ({
    isOnInitialModalRoute: { value: false },
    clearModalState: vi.fn()
  })
}))

describe('useRouteWatcher channel routes', () => {
  const threadId = '10000000-0000-4000-8000-000000000001'
  let scope: ReturnType<typeof effectScope>

  beforeEach(() => {
    vi.resetAllMocks()
    mocks.route = reactive({
      name: 'channel',
      params: { channel: `missing/parent/${threadId}` },
      query: { message: 'entry-message' }
    })
    mocks.channels = {
      channelsMap: ref(new Map()),
      bothChannelsMapInitialFetchPromise: Promise.resolve()
    }
    mocks.channelPathStringToId.mockReturnValue(null)
    scope = effectScope()
  })

  afterEach(() => scope.stop())

  const open = () => {
    const watcher = scope.run(() => useRouteWatcher())
    if (!watcher) throw new Error('inactive scope')
    watcher.triggerRouteParamChange()
    return watcher.routeWatcherState
  }

  test('opens a thread using the final UUID without resolving its parent path', async () => {
    mocks.getChannel.mockResolvedValue({
      data: { id: threadId, parentMessageId: 'parent-message' }
    })
    const state = open()
    await flushPromises()

    expect(mocks.getChannel).toHaveBeenCalledWith(threadId)
    expect(mocks.changePrimaryViewToThread).toHaveBeenCalledWith({
      channelId: threadId,
      entryMessageId: 'entry-message'
    })
    expect(state.view).toBe('main')
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  test('opens a resolved channel without requesting a thread', async () => {
    mocks.channelPathStringToId.mockReturnValue('channel-id')
    open()
    await flushPromises()

    expect(mocks.changePrimaryViewToChannel).toHaveBeenCalledWith({
      channelId: 'channel-id',
      entryMessageId: 'entry-message'
    })
    expect(mocks.getChannel).not.toHaveBeenCalled()
  })

  test.each([`missing/parent/${threadId}`, threadId])(
    'replaces %s with the actual parent path and preserves query and hash',
    async channelParam => {
      mocks.route['params'] = { channel: channelParam }
      mocks.route['query'] = { message: 'entry-message', extra: 'value' }
      mocks.route['hash'] = '#anchor'
      mocks.getChannel.mockResolvedValue({
        data: {
          id: threadId,
          parentId: 'parent-id',
          parentMessageId: 'parent-message'
        }
      })
      mocks.channelIdToPathString.mockReturnValue('actual/parent')
      const state = open()
      await flushPromises()

      expect(mocks.channelIdToPathString).toHaveBeenCalledWith('parent-id')
      expect(mocks.replace).toHaveBeenCalledWith({
        path: `/channels/actual/parent/${threadId}`,
        query: { message: 'entry-message', extra: 'value' },
        hash: '#anchor'
      })
      expect(state.view).toBe('main')
    }
  )

  test('does not redirect an already canonical thread URL', async () => {
    mocks.route['params'] = { channel: `actual/parent/${threadId}` }
    mocks.getChannel.mockResolvedValue({
      data: {
        id: threadId,
        parentId: 'parent-id',
        parentMessageId: 'parent-message'
      }
    })
    mocks.channelIdToPathString.mockReturnValue('actual/parent')
    open()
    await flushPromises()

    expect(mocks.changePrimaryViewToThread).toHaveBeenCalled()
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  test('keeps the thread view when the parent path cannot be resolved', async () => {
    mocks.getChannel.mockResolvedValue({
      data: {
        id: threadId,
        parentId: 'parent-id',
        parentMessageId: 'parent-message'
      }
    })
    mocks.channelIdToPathString.mockResolvedValue(null)
    const state = open()
    await flushPromises()

    expect(state.view).toBe('main')
    expect(mocks.changePrimaryViewToThread).toHaveBeenCalled()
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  test.each([undefined, null, ''])(
    'rejects a non-thread response (%s)',
    async parentMessageId => {
      mocks.getChannel.mockResolvedValue({
        data: { id: threadId, parentMessageId }
      })
      open()
      await flushPromises()

      expect(mocks.changePrimaryViewToThread).not.toHaveBeenCalled()
      expect(mocks.replace).toHaveBeenCalledWith('/channels/general')
    }
  )

  test('falls back when the channel request fails', async () => {
    mocks.getChannel.mockRejectedValue(new Error('not found'))
    open()
    await flushPromises()

    expect(mocks.changePrimaryViewToThread).not.toHaveBeenCalled()
    expect(mocks.replace).toHaveBeenCalledWith('/channels/general')
  })

  test('does not request a channel for a non-UUID suffix', async () => {
    mocks.route['params'] = { channel: 'missing/channel' }
    open()
    await flushPromises()

    expect(mocks.getChannel).not.toHaveBeenCalled()
    expect(mocks.replace).toHaveBeenCalledWith('/channels/general')
  })

  test('ignores a response after navigating away', async () => {
    let resolve!: (value: unknown) => void
    mocks.getChannel.mockReturnValue(
      new Promise(r => {
        resolve = r
      })
    )
    open()
    await flushPromises()
    mocks.route['name'] = 'user'
    resolve({ data: { id: threadId, parentMessageId: 'parent-message' } })
    await flushPromises()

    expect(mocks.changePrimaryViewToThread).not.toHaveBeenCalled()
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
