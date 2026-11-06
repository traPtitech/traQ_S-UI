import type { Message } from '@traptitech/traq'

import { reactive, shallowRef } from 'vue'

import { flushPromises } from '@vue/test-utils'

import useClipsFetcher from '/@/components/Main/MainView/ClipsView/ClipsViewContent/composables/useClipsFetcher'

import { withSetup } from '../../../../../../testUtils'

const mocks = vi.hoisted(() => ({
  getClips: vi.fn(),
  extend: vi.fn(),
  messages: new Map<string, Message>()
}))

vi.mock('/@/lib/apis', () => ({ default: { getClips: mocks.getClips } }))

vi.mock('/@/lib/websocket', async () => {
  const { default: mitt } = await import('mitt')

  return { wsListener: mitt() }
})

vi.mock('/@/store/entities/messages', () => ({
  useMessagesStore: () => ({
    isMessageDeleted: () => false,
    withMessageUpdates: <T>(
      read: (
        cacheMessages: (messages: readonly Message[]) => Message[]
      ) => Promise<T>,
      signal?: AbortSignal
    ) =>
      read(messages => {
        signal?.throwIfAborted()

        mocks.extend(messages)
        return [...messages]
      }),
    messagesMap: { value: mocks.messages },
    fetchMessage: vi.fn()
  })
}))

vi.mock('/@/store/domain/messagesView', () => ({
  useMessagesView: () => ({
    renderMessageContent: vi.fn(),
    resetRenderedContent: vi.fn()
  })
}))

vi.mock('/@/store/domain/viewStateSenderStore', async () => {
  const { ref } = await import('vue')

  return {
    useViewStateSenderStore: () => ({ shouldReceiveLatestMessages: ref(false) })
  }
})

vi.mock(
  '/@/components/Main/MainView/MessagesScroller/composables/useFetchLimit',
  async () => {
    const { ref } = await import('vue')

    return {
      default: () => ({
        fetchLimit: ref(2),
        waitHeightResolved: Promise.resolve()
      })
    }
  }
)

const original: Message = {
  id: 'shared-message',
  channelId: 'channel',
  threadId: null,
  userId: 'user',
  content: 'original',
  createdAt: '2026-11-02T11:40:00Z',
  updatedAt: '2026-11-02T11:40:00Z',
  pinned: false,
  stamps: []
}

const response = (messages: Message[], hasMore: boolean) => ({
  data: messages.map(message => ({ message })),
  headers: { 'x-traq-more': String(hasMore) }
})

const disposers: Array<() => void> = []

beforeEach(() => {
  vi.resetAllMocks()
  mocks.messages.clear()

  mocks.extend.mockImplementation((messages: Message[]) => {
    for (const message of messages) mocks.messages.set(message.id, message)
  })
})

afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

it.each([false, true])(
  'preserves the current folder cache, cursor and end flag after a stale response with hasMore=%s',
  async hasMore => {
    const pending = Promise.withResolvers<ReturnType<typeof response>>()
    const fresh = { ...original, content: 'edited' }

    mocks.getClips
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(response([fresh], true))

    const props = reactive({ clipFolderId: 'old-folder' })

    const [fetcher, { unmount }] = withSetup(() =>
      useClipsFetcher(shallowRef(), props)
    )()

    disposers.push(unmount)
    await flushPromises()
    props.clipFolderId = 'current-folder'
    await flushPromises()

    expect(mocks.messages.get(original.id)?.content).toBe('edited')

    pending.resolve(response([original], hasMore))
    await flushPromises()

    expect(mocks.messages.get(original.id)?.content).toBe('edited')
    expect(fetcher.messageIds.value).toEqual([original.id])
    expect(fetcher.hasReachedOldest.value).toBe(false)

    mocks.getClips.mockResolvedValueOnce(response([], false))
    await fetcher.onLoadOlderMessagesRequest()

    expect(mocks.getClips).toHaveBeenLastCalledWith(
      'current-folder',
      2,
      2,
      undefined,
      { signal: expect.any(AbortSignal) }
    )
    expect(fetcher.hasReachedOldest.value).toBe(true)
  }
)
