import type * as Vue from 'vue'
import { ref } from 'vue'

import useActivityStream from '/@/components/Main/NavigationBar/NavigationContent/composables/useActivityStream'

const mocks = vi.hoisted(() => ({
  listeners: new Map<string, (payload: unknown) => Promise<void>>(),
  fetchThread: vi.fn(),
  level: vi.fn(),
  subscribed: vi.fn(),
  fetchSettings: vi.fn().mockResolvedValue(undefined)
}))

const mode = ref({ all: false, perChannel: false })
const channelsMap = ref(new Map([['channel', {}]]))
const dmChannelsMap = ref(new Map([['dm', {}]]))

vi.mock('vue', async importOriginal => ({
  ...(await importOriginal<typeof Vue>()),
  onMounted: vi.fn()
}))

vi.mock('/@/composables/utils/useMittListener', () => ({
  default: (
    _mitt: unknown,
    event: string,
    listener: (payload: unknown) => Promise<void>
  ) => mocks.listeners.set(event, listener)
}))

vi.mock('/@/lib/apis', () => ({ default: { getActivityTimeline: vi.fn() } }))

vi.mock('/@/lib/websocket', () => ({ setTimelineStreamingState: vi.fn() }))

vi.mock('/@/store/app/browserSettings', () => ({
  useBrowserSettings: () => ({ activityMode: mode })
}))

vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({ channelsMap, dmChannelsMap })
}))

vi.mock('/@/store/entities/threads', () => ({
  useThreadsStore: () => ({ fetchThread: mocks.fetchThread })
}))

vi.mock('/@/store/entities/messages', () => ({ messageMitt: {} }))

vi.mock('/@/store/domain/subscription', () => ({
  useSubscriptionStore: () => ({
    isChannelSubscribed: mocks.subscribed,
    getEffectiveSubscriptionLevel: mocks.level,
    fetchSubscriptions: mocks.fetchSettings,
    fetchThreadSubscriptions: mocks.fetchSettings,
    fetchThreadSubscriptionDefaults: mocks.fetchSettings
  })
}))

describe('activity thread subscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mode.value.all = false
    mocks.fetchThread.mockResolvedValue({ id: 'thread' })
    mocks.level.mockReturnValue(1)
    mocks.subscribed.mockReturnValue(true)
  })

  const add = (channelId: string) =>
    mocks.listeners.get('addMessage')?.({
      message: { id: 'message', channelId }
    })

  it.each([0, 1, 2, undefined])(
    'filters by effective level %s after fetching the thread',
    async level => {
      mocks.level.mockReturnValue(level)
      const { timeline } = useActivityStream()

      await add('thread')

      expect(mocks.fetchThread).toHaveBeenCalledWith('thread')
      expect(mocks.fetchSettings).not.toHaveBeenCalled()
      expect(timeline.value).toHaveLength(level === 1 || level === 2 ? 1 : 0)
    }
  )

  it('keeps normal channel and DM handling', async () => {
    const { timeline } = useActivityStream()

    await add('dm')

    expect(timeline.value).toHaveLength(0)

    await add('channel')

    expect(timeline.value).toHaveLength(1)
    expect(mocks.level).toHaveBeenCalledWith('channel')
    expect(mocks.fetchThread).not.toHaveBeenCalled()
  })

  it('ignores a channel whose effective level is unknown', async () => {
    mocks.level.mockReturnValue(undefined)
    const { timeline } = useActivityStream()

    await add('unknown')

    expect(timeline.value).toHaveLength(0)
    expect(mocks.fetchThread).toHaveBeenCalledWith('unknown')
  })

  it('resolves inheritance after fetching metadata', async () => {
    mocks.level.mockReturnValue(undefined)
    mocks.fetchThread.mockImplementationOnce(async () => {
      mocks.level.mockReturnValue(2)
    })
    const { timeline } = useActivityStream()

    await add('thread')

    expect(timeline.value).toHaveLength(1)
  })

  it('handles a failed metadata fetch', async () => {
    mocks.fetchThread.mockRejectedValueOnce(new Error('network'))
    const { timeline } = useActivityStream()

    await add('thread')

    expect(timeline.value).toHaveLength(0)
  })
})
