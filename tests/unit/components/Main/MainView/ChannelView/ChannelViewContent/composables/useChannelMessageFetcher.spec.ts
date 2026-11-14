import type { Message } from '@traptitech/traq'

import { defineComponent, ref, shallowRef } from 'vue'

import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'

import useChannelMessageFetcher from '/@/components/Main/MainView/ChannelView/ChannelViewContent/composables/useChannelMessageFetcher'

interface MessagesResponse {
  data: Message[]
  headers: { 'x-traq-more': 'true' | 'false' }
}

const { getMessages, fetchMessage } = vi.hoisted(() => ({
  getMessages:
    vi.fn<
      (
        channelId: string,
        limit: number,
        offset?: number,
        since?: string,
        until?: string,
        inclusive?: boolean,
        order?: 'asc' | 'desc'
      ) => Promise<MessagesResponse>
    >(),
  fetchMessage: vi.fn<(args: { messageId: string }) => Promise<Message>>()
}))

vi.mock('/@/lib/apis', () => ({ default: { getMessages } }))
vi.mock('/@/lib/websocket', () => ({ wsListener: {} }))
vi.mock('/@/composables/utils/useMittListener', () => ({ default: vi.fn() }))
vi.mock('/@/store/domain/messagesView', () => ({
  useMessagesView: () => ({
    renderMessageContent: vi.fn(),
    resetRenderedContent: vi.fn()
  })
}))
vi.mock('/@/store/domain/subscription', () => ({
  useSubscriptionStore: () => ({
    unreadChannelsMap: ref(new Map()),
    unreadChannelsMapInitialFetchPromise: Promise.resolve(),
    deleteUnreadChannelWithSend: vi.fn()
  })
}))
vi.mock('/@/store/domain/viewStateSenderStore', () => ({
  useViewStateSenderStore: () => ({ shouldReceiveLatestMessages: ref(false) })
}))
vi.mock('/@/store/entities/messages', () => ({
  messageMitt: {},
  useMessagesStore: () => ({ fetchMessage, extendMessagesMap: vi.fn() })
}))

const message = (
  id: string,
  channelId: string,
  createdAt: string
): Message => ({
  id,
  channelId,
  userId: 'user',
  content: id,
  createdAt,
  updatedAt: createdAt,
  pinned: false,
  stamps: [],
  threadId: null
})

const response = (data: Message[], hasMore: boolean): MessagesResponse => ({
  data,
  headers: { 'x-traq-more': hasMore ? 'true' : 'false' }
})

const mountTimeline = (entry: Message) => {
  let timeline: ReturnType<typeof useChannelMessageFetcher> | undefined
  const wrapper = mount(
    defineComponent({
      props: {
        channelId: { type: String, required: true },
        entryMessageId: { type: String, required: true }
      },
      setup(props) {
        const scroller = document.createElement('div')
        Object.defineProperty(scroller, 'clientHeight', { value: 600 })
        const scrollerRef = shallowRef<{ $el: HTMLDivElement }>()
        timeline = useChannelMessageFetcher(scrollerRef, props)
        scrollerRef.value = { $el: scroller }

        return () => null
      }
    }),
    { props: { channelId: entry.channelId, entryMessageId: entry.id } }
  )

  if (!timeline) throw new Error('Timeline failed to mount')

  return { wrapper, timeline }
}

enableAutoUnmount(afterEach)

beforeEach(() => {
  getMessages.mockReset()
  fetchMessage.mockReset()
})

it.each(['another channel', 'the same channel'])(
  'continues loading after a stale response from %s',
  async destination => {
    const source = message(
      'source',
      'source-channel',
      '2026-11-14T05:44:28.857Z'
    )
    const destinationChannel =
      destination === 'the same channel' ? source.channelId : 'target-channel'
    const target = message(
      'target',
      destinationChannel,
      '2026-03-17T13:44:46.483Z'
    )
    const later = message(
      'later',
      destinationChannel,
      '2026-03-17T13:47:50.809Z'
    )
    const next = message('next', destinationChannel, '2026-03-17T13:48:06.626Z')
    const stale = Promise.withResolvers<MessagesResponse>()

    fetchMessage.mockImplementation(async ({ messageId }) =>
      messageId === source.id ? source : target
    )
    getMessages.mockImplementation(async (_channel, _limit, _offset, since) => {
      if (!since) return response([], true)
      if (since === source.createdAt) return stale.promise
      if (since === target.createdAt) return response([later], true)
      if (since === later.createdAt) return response([next], false)

      throw new Error(`Unexpected pagination cursor: ${since}`)
    })

    const { wrapper, timeline } = mountTimeline(source)
    await flushPromises()
    expect(getMessages).toHaveBeenCalledWith(
      source.channelId,
      10,
      undefined,
      source.createdAt,
      undefined,
      undefined,
      'asc'
    )

    await wrapper.setProps({
      channelId: destinationChannel,
      entryMessageId: target.id
    })
    await flushPromises()
    expect(timeline.messageIds.value).toEqual([target.id, later.id])

    stale.resolve(response([source], false))
    await flushPromises()

    expect(timeline.isReachedLatest.value).toBe(false)
    await timeline.onLoadLatterMessagesRequest()
    expect(getMessages).toHaveBeenLastCalledWith(
      destinationChannel,
      10,
      undefined,
      later.createdAt,
      undefined,
      undefined,
      'asc'
    )
    expect(timeline.messageIds.value).toEqual([target.id, later.id, next.id])
    expect(timeline.isReachedLatest.value).toBe(true)
  }
)
