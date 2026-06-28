import { ChannelSubscribeLevel } from '@traptitech/traq'

import { type Ref, computed, nextTick, ref } from 'vue'

import useChannelSubscriptionState, {
  CACHE_EXPIRE_TIME
} from '/@/composables/subscription/useChannelSubscriptionState'
import { IterableCache } from '/@/lib/cache'
import type { ChannelId } from '/@/types/entity-ids'

const mockSubscriptionMap: Ref<Map<ChannelId, ChannelSubscribeLevel>> = ref(
  new Map()
)

vi.mock('/@/store/domain/subscription', () => ({
  useSubscriptionStore: () => ({
    getSubscriptionLevel: (channelId: ChannelId) =>
      mockSubscriptionMap.value.get(channelId) ?? ChannelSubscribeLevel.none,
    changeSubscriptionLevel: (
      channelId: ChannelId,
      level: ChannelSubscribeLevel
    ) => {
      const newMap = new Map(mockSubscriptionMap.value)
      newMap.set(channelId, level)
      mockSubscriptionMap.value = newMap
    }
  })
}))

const {
  mockSetChannelSubscribeLevel,
  mockBeaconDispatcher,
  mockCreateBeaconDispatcher,
  mockFlush,
  mockCancel,
  mockFlushableDebounce
} = vi.hoisted(() => {
  const mockSetChannelSubscribeLevel = vi.fn().mockResolvedValue({})
  const mockBeaconDispatcher = vi.fn().mockResolvedValue({})
  const mockCreateBeaconDispatcher = vi
    .fn()
    .mockResolvedValue(() => mockBeaconDispatcher())

  const mockFlush = vi.fn().mockReturnValue(Promise.resolve())
  const mockCancel = vi.fn()
  const mockFlushableDebounce = vi.fn().mockImplementation((_delay, fn) => {
    const debounced = Object.assign(
      vi.fn().mockImplementation((...args: unknown[]) => fn(...args)),
      {
        flush: mockFlush,
        cancel: mockCancel
      }
    )
    return debounced
  })

  return {
    mockSetChannelSubscribeLevel,
    mockBeaconDispatcher,
    mockCreateBeaconDispatcher,
    mockFlush,
    mockCancel,
    mockFlushableDebounce
  }
})

vi.mock('/@/lib/apis', () => ({
  default: {
    setChannelSubscribeLevel: mockSetChannelSubscribeLevel
  },
  BASE_PATH: '/api/v3',
  WEBSOCKET_ENDPOINT: '/api/v3/ws'
}))

vi.mock('/@/lib/beacon', () => ({
  default: mockCreateBeaconDispatcher
}))

vi.mock('/@/lib/flushableDebounce', () => ({
  default: mockFlushableDebounce
}))

describe('useChannelSubscriptionState', () => {
  const testChannelId = 'test-channel-id' as ChannelId

  let windowAddEventListenerSpy: ReturnType<typeof vi.spyOn>
  let documentAddEventListenerSpy: ReturnType<typeof vi.spyOn>

  const windowEventHandlers = new Map<
    string,
    EventListenerOrEventListenerObject[]
  >()
  const documentEventHandlers = new Map<
    string,
    EventListenerOrEventListenerObject[]
  >()

  beforeEach(() => {
    vi.useFakeTimers()
    mockSubscriptionMap.value = new Map([
      [testChannelId, ChannelSubscribeLevel.subscribed]
    ])

    windowEventHandlers.clear()
    documentEventHandlers.clear()

    windowAddEventListenerSpy = vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, handler) => {
        const handlers = windowEventHandlers.get(type) ?? []
        handlers.push(handler)
        windowEventHandlers.set(type, handlers)
      })

    documentAddEventListenerSpy = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation((type, handler) => {
        const handlers = documentEventHandlers.get(type) ?? []
        handlers.push(handler)
        documentEventHandlers.set(type, handlers)
      })

    mockSetChannelSubscribeLevel.mockClear()
    mockBeaconDispatcher.mockClear()
    mockCreateBeaconDispatcher.mockClear()
    mockFlush.mockClear()
    mockCancel.mockClear()
    mockFlushableDebounce.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    windowAddEventListenerSpy.mockRestore()
    documentAddEventListenerSpy.mockRestore()
  })

  describe('initialization', () => {
    it('should return currentChannelSubscription computed', () => {
      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should return changeSubscriptionLevel function', () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      expect(typeof changeSubscriptionLevel).toBe('function')
    })

    it('should return changeToNextSubscriptionLevel function', () => {
      const channelIdRef = ref(testChannelId)
      const { changeToNextSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      expect(typeof changeToNextSubscriptionLevel).toBe('function')
    })

    it('should read subscription level from store', () => {
      const anotherChannelId = 'another-channel' as ChannelId
      mockSubscriptionMap.value = new Map([
        ...mockSubscriptionMap.value,
        [anotherChannelId, ChannelSubscribeLevel.notified]
      ])

      const channelIdRef = ref(anotherChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })

    it('should return none for non-existent channel', () => {
      const nonExistentChannelId = 'non-existent' as ChannelId
      const channelIdRef = ref(nonExistentChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)
    })

    it('should work with different initial subscription levels', () => {
      const levels = [
        ChannelSubscribeLevel.none,
        ChannelSubscribeLevel.subscribed,
        ChannelSubscribeLevel.notified
      ]

      levels.forEach((level, index) => {
        const channelId = `channel-init-${index}` as ChannelId
        mockSubscriptionMap.value = new Map([
          ...mockSubscriptionMap.value,
          [channelId, level]
        ])

        const channelIdRef = ref(channelId)
        const { currentChannelSubscription } =
          useChannelSubscriptionState(channelIdRef)

        expect(currentChannelSubscription.value).toBe(level)
      })
    })
  })

  describe('changeSubscriptionLevel', () => {
    it('should update store immediately (optimistic update)', async () => {
      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })

    it('should update to none level', async () => {
      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.none)
      await nextTick()

      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)
    })

    it('should update to subscribed level', async () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)

      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should update different channels independently', async () => {
      const channel1 = 'channel-1' as ChannelId
      const channel2 = 'channel-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.none],
        [channel2, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(channel2)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()

      expect(mockSubscriptionMap.value.get(channel2)).toBe(
        ChannelSubscribeLevel.subscribed
      )
      expect(mockSubscriptionMap.value.get(channel1)).toBe(
        ChannelSubscribeLevel.none
      )
    })

    it('should handle rapid subscription level changes', async () => {
      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.none)
      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await changeSubscriptionLevel(ChannelSubscribeLevel.none)
      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should handle setting same level multiple times', async () => {
      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })
  })

  describe('changeToNextSubscriptionLevel', () => {
    it('should cycle from subscribed to notified', async () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.subscribed]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeToNextSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )

      changeToNextSubscriptionLevel()
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })

    it('should cycle from notified to none', async () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.notified]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeToNextSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )

      changeToNextSubscriptionLevel()
      await nextTick()

      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)
    })

    it('should cycle from none to subscribed', async () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeToNextSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)

      changeToNextSubscriptionLevel()
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should complete full cycle', async () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeToNextSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      // none -> subscribed
      changeToNextSubscriptionLevel()
      await nextTick()
      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )

      // subscribed -> notified
      changeToNextSubscriptionLevel()
      await nextTick()
      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )

      // notified -> none
      changeToNextSubscriptionLevel()
      await nextTick()
      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)

      changeToNextSubscriptionLevel()
      await nextTick()
      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should handle multiple cycles', async () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription, changeToNextSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      for (let cycle = 0; cycle < 3; cycle++) {
        changeToNextSubscriptionLevel()
        await nextTick()
        expect(currentChannelSubscription.value).toBe(
          ChannelSubscribeLevel.subscribed
        )

        changeToNextSubscriptionLevel()
        await nextTick()
        expect(currentChannelSubscription.value).toBe(
          ChannelSubscribeLevel.notified
        )

        changeToNextSubscriptionLevel()
        await nextTick()
        expect(currentChannelSubscription.value).toBe(
          ChannelSubscribeLevel.none
        )
      }
    })
  })

  describe('channel switching', () => {
    it('should react to channelId changes', async () => {
      const channel1 = 'channel-switch-1' as ChannelId
      const channel2 = 'channel-switch-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.subscribed],
        [channel2, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(channel1)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )

      channelIdRef.value = channel2
      await nextTick()

      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)
    })

    it('should work with computed channelId', async () => {
      const channel1 = 'channel-computed-1' as ChannelId
      const channel2 = 'channel-computed-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.notified],
        [channel2, ChannelSubscribeLevel.subscribed]
      ])

      const currentIndex = ref(0)
      const channels = [channel1, channel2]
      const channelIdRef = computed(
        () => channels[currentIndex.value] as ChannelId
      )

      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )

      currentIndex.value = 1
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should maintain state per channel across ref changes', async () => {
      const channel1 = 'channel-maintain-1' as ChannelId
      const channel2 = 'channel-maintain-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.none],
        [channel2, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(channel1)
      const { currentChannelSubscription, changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()
      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )

      // Switch to channel2
      channelIdRef.value = channel2
      await nextTick()
      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)

      channelIdRef.value = channel1
      await nextTick()
      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should handle rapid channel switching', async () => {
      const channels = [
        'rapid-1',
        'rapid-2',
        'rapid-3',
        'rapid-4',
        'rapid-5'
      ] as ChannelId[]

      mockSubscriptionMap.value = new Map(
        channels.map((ch, i) => [
          ch,
          i % 2 === 0
            ? ChannelSubscribeLevel.subscribed
            : ChannelSubscribeLevel.none
        ])
      )

      const channelIdRef = ref(channels[0] as ChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      for (let i = 0; i < channels.length; i++) {
        channelIdRef.value = channels[i] as ChannelId
        await nextTick()
        expect(currentChannelSubscription.value).toBe(
          i % 2 === 0
            ? ChannelSubscribeLevel.subscribed
            : ChannelSubscribeLevel.none
        )
      }
    })
  })

  describe('multiple instances', () => {
    it('should create independent instances for different refs', () => {
      const channel1 = 'multi-1' as ChannelId
      const channel2 = 'multi-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.subscribed],
        [channel2, ChannelSubscribeLevel.none]
      ])

      const ref1 = ref(channel1)
      const ref2 = ref(channel2)

      const state1 = useChannelSubscriptionState(ref1)
      const state2 = useChannelSubscriptionState(ref2)

      expect(state1.currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
      expect(state2.currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.none
      )
    })

    it('should update independently', async () => {
      const channel1 = 'multi-update-1' as ChannelId
      const channel2 = 'multi-update-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.none],
        [channel2, ChannelSubscribeLevel.none]
      ])

      const ref1 = ref(channel1)
      const ref2 = ref(channel2)

      const state1 = useChannelSubscriptionState(ref1)
      const state2 = useChannelSubscriptionState(ref2)

      await state1.changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()

      expect(state1.currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
      expect(state2.currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.none
      )

      await state2.changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      expect(state1.currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
      expect(state2.currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })
  })

  describe('edge cases', () => {
    it('should handle empty channel ID gracefully', async () => {
      const emptyChannelId = '' as ChannelId
      const channelIdRef = ref(emptyChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
    })

    it('should handle undefined-like channel IDs', () => {
      const zeroChannelId = '0' as ChannelId
      mockSubscriptionMap.value = new Map([
        [zeroChannelId, ChannelSubscribeLevel.notified]
      ])

      const channelIdRef = ref(zeroChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })

    it('should handle very long channel IDs', () => {
      const longChannelId = 'a'.repeat(1000) as ChannelId
      mockSubscriptionMap.value = new Map([
        [longChannelId, ChannelSubscribeLevel.subscribed]
      ])

      const channelIdRef = ref(longChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should handle special characters in channel IDs', () => {
      const specialChannelId = 'channel-特殊文字-🎉' as ChannelId
      mockSubscriptionMap.value = new Map([
        [specialChannelId, ChannelSubscribeLevel.notified]
      ])

      const channelIdRef = ref(specialChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })
  })

  describe('subscription level values', () => {
    it('should correctly read ChannelSubscribeLevel.none (0)', () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(0)
      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)
    })

    it('should correctly read ChannelSubscribeLevel.subscribed (1)', () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.subscribed]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(1)
      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should correctly read ChannelSubscribeLevel.notified (2)', () => {
      mockSubscriptionMap.value = new Map([
        [testChannelId, ChannelSubscribeLevel.notified]
      ])

      const channelIdRef = ref(testChannelId)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(2)
      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.notified
      )
    })
  })

  describe('event listener registration', () => {
    it('should register visibilitychange event listener on document', () => {
      const channelIdRef = ref(testChannelId)
      useChannelSubscriptionState(channelIdRef)

      expect(documentEventHandlers.has('visibilitychange')).toBe(true)
      expect(
        documentEventHandlers.get('visibilitychange')?.length
      ).toBeGreaterThan(0)
    })

    it('should register blur event listener on window', () => {
      const channelIdRef = ref(testChannelId)
      useChannelSubscriptionState(channelIdRef)

      expect(windowEventHandlers.has('blur')).toBe(true)
      expect(windowEventHandlers.get('blur')?.length).toBeGreaterThan(0)
    })

    it('should register pagehide and beforeunload event listeners on window', () => {
      const channelIdRef = ref(testChannelId)
      useChannelSubscriptionState(channelIdRef)

      expect(windowEventHandlers.has('pagehide')).toBe(true)
      expect(windowEventHandlers.has('beforeunload')).toBe(true)
    })

    it('should register multiple event listeners on composable creation', () => {
      const channelIdRef = ref(testChannelId)
      useChannelSubscriptionState(channelIdRef)

      const totalWindowEvents = Array.from(windowEventHandlers.values()).reduce(
        (sum, handlers) => sum + handlers.length,
        0
      )
      const totalDocumentEvents = Array.from(
        documentEventHandlers.values()
      ).reduce((sum, handlers) => sum + handlers.length, 0)
      expect(totalWindowEvents + totalDocumentEvents).toBeGreaterThanOrEqual(3)
    })
  })

  describe('beacon dispatcher', () => {
    it('should create beacon dispatcher when changing subscription level', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)

      expect(mockCreateBeaconDispatcher).toHaveBeenCalled()
    })

    it('should create beacon dispatcher with correct parameters', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)

      expect(mockCreateBeaconDispatcher).toHaveBeenCalledWith(
        expect.any(Function),
        testChannelId,
        { level: ChannelSubscribeLevel.notified }
      )
    })

    it('should create new beacon dispatcher for each subscription change', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.none)
      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)

      expect(mockCreateBeaconDispatcher).toHaveBeenCalledTimes(3)
    })
  })

  describe('watch behavior', () => {
    it('should set up watch on channelIdRef', async () => {
      const channel1 = 'watch-channel-1' as ChannelId
      const channel2 = 'watch-channel-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.subscribed],
        [channel2, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(channel1)
      const { currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )

      channelIdRef.value = channel2
      await nextTick()

      expect(currentChannelSubscription.value).toBe(ChannelSubscribeLevel.none)
    })
  })

  describe('cache behavior', () => {
    it('should cache state per channel', async () => {
      const channel = 'cache-test' as ChannelId
      mockSubscriptionMap.value = new Map([
        [channel, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(channel)
      const { changeSubscriptionLevel, currentChannelSubscription } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()

      expect(currentChannelSubscription.value).toBe(
        ChannelSubscribeLevel.subscribed
      )

      expect(mockSubscriptionMap.value.get(channel)).toBe(
        ChannelSubscribeLevel.subscribed
      )
    })

    it('should expire cache after CACHE_EXPIRE_TIME', async () => {
      const channel = 'expire-test' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel, ChannelSubscribeLevel.none]
      ])

      const deleteSpy = vi.spyOn(IterableCache.prototype, 'delete')

      const channelIdRef = ref(channel)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()

      const blurHandlers = windowEventHandlers.get('blur')
      const blurHandler = blurHandlers?.[0]
      if (typeof blurHandler === 'function') {
        blurHandler(new Event('blur'))
      }

      expect(deleteSpy).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(CACHE_EXPIRE_TIME - 100)
      expect(deleteSpy).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(200) // Total > CACHE_EXPIRE_TIME

      expect(deleteSpy).toHaveBeenCalledWith(channel)

      deleteSpy.mockRestore()
    })
  })

  describe('flush on events', () => {
    it('should call flushAll when visibilitychange fires (document.hidden = true)', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      const visibilityHandlers = documentEventHandlers.get('visibilitychange')
      expect(visibilityHandlers).toBeDefined()
      expect(visibilityHandlers?.length).toBeGreaterThan(0)

      const visibilityHandler = visibilityHandlers?.[0]

      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: true
      })

      if (typeof visibilityHandler === 'function') {
        visibilityHandler(new Event('visibilitychange'))
      }

      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false
      })

      expect(mockFlush).toHaveBeenCalled()
    })

    it('should not call flushAll when visibilitychange fires (document.hidden = false)', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      const visibilityHandlers = documentEventHandlers.get('visibilitychange')
      expect(visibilityHandlers).toBeDefined()

      const visibilityHandler = visibilityHandlers?.[0]

      mockFlush.mockClear()

      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false
      })

      if (typeof visibilityHandler === 'function') {
        visibilityHandler(new Event('visibilitychange'))
      }

      expect(mockFlush).not.toHaveBeenCalled()
    })

    it('should call flushAll when blur event fires', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      const blurHandlers = windowEventHandlers.get('blur')
      expect(blurHandlers).toBeDefined()
      expect(blurHandlers?.length).toBeGreaterThan(0)

      const blurHandler = blurHandlers?.[0]

      mockFlush.mockClear()

      if (typeof blurHandler === 'function') {
        blurHandler(new Event('blur'))
      }

      expect(mockFlush).toHaveBeenCalled()
    })

    it('should call fastFlushAll when pagehide fires', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      const pageHideHandlers = windowEventHandlers.get('pagehide')
      expect(pageHideHandlers).toBeDefined()

      const pageHideHandler = pageHideHandlers?.[0]

      // Clear mocks before test
      mockCancel.mockClear()
      mockBeaconDispatcher.mockClear()

      if (typeof pageHideHandler === 'function') {
        pageHideHandler(new Event('pagehide'))
      }

      expect(mockCancel).toHaveBeenCalledWith({ upcomingOnly: true })
    })

    it('should call fastFlushAll when beforeunload fires', async () => {
      const channelIdRef = ref(testChannelId)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.notified)
      await nextTick()

      const beforeUnloadHandlers = windowEventHandlers.get('beforeunload')
      expect(beforeUnloadHandlers).toBeDefined()

      const beforeUnloadHandler = beforeUnloadHandlers?.[0]

      // Clear mocks before test
      mockCancel.mockClear()
      mockBeaconDispatcher.mockClear()

      if (typeof beforeUnloadHandler === 'function') {
        beforeUnloadHandler(new Event('beforeunload'))
      }

      expect(mockCancel).toHaveBeenCalledWith({ upcomingOnly: true })
    })

    it('should flush previous channel state when channelId changes', async () => {
      const channel1 = 'flush-test-1' as ChannelId
      const channel2 = 'flush-test-2' as ChannelId

      mockSubscriptionMap.value = new Map([
        [channel1, ChannelSubscribeLevel.none],
        [channel2, ChannelSubscribeLevel.none]
      ])

      const channelIdRef = ref(channel1)
      const { changeSubscriptionLevel } =
        useChannelSubscriptionState(channelIdRef)

      await changeSubscriptionLevel(ChannelSubscribeLevel.subscribed)
      await nextTick()

      mockFlush.mockClear()

      channelIdRef.value = channel2
      await nextTick()

      expect(mockFlush).toHaveBeenCalled()
    })
  })
})
