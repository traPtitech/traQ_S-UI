import type { Message } from '@traptitech/traq'

import { reactive, ref } from 'vue'

import { flushPromises } from '@vue/test-utils'

import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'

import { withSetup } from '../../../../../testUtils'

const mocks = vi.hoisted(() => ({
  render: vi.fn(),
  fetchMessage: vi.fn()
}))

vi.mock('/@/store/domain/messagesView', () => ({
  useMessagesView: () => ({
    renderMessageContent: mocks.render,
    resetRenderedContent: vi.fn()
  })
}))

vi.mock('/@/store/domain/viewStateSenderStore', async () => {
  const { ref } = await import('vue')

  return {
    useViewStateSenderStore: () => ({ shouldReceiveLatestMessages: ref(false) })
  }
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

        return [...messages]
      }),
    messagesMap: { value: new Map() },
    fetchMessage: mocks.fetchMessage
  })
}))

const message = (id: string) => ({ id }) as Message
const page = (ids: string[]) => ({ messages: ids.map(message), cursor: 0 })
const disposers: Array<() => void> = []

const create = () => {
  const props = reactive<{ entryMessageId?: string }>({})
  const id = ref('ch:same-channel')
  const older = vi.fn<() => Promise<string[]>>().mockResolvedValue([])
  const newer = vi.fn<() => Promise<string[]>>().mockResolvedValue([])

  const around = vi
    .fn<(entry: Message) => Promise<string[]>>()
    .mockResolvedValue([])

  const latest = vi.fn<() => Promise<string[]>>().mockResolvedValue([])

  const [fetcher, { unmount }] = withSetup(() =>
    useMessageFetcher({
      source: id,
      entryMessageId: () => props.entryMessageId,
      initialCursor: () => 0,
      limit: 20,
      autoLoad: false,
      resolveMessage: id => mocks.fetchMessage({ messageId: id }),

      load: {
        older: async () => page(await older()),
        newer: async () => page(await newer()),
        around: async ({ entryMessage }) => page(await around(entryMessage)),
        catchUp: async () => ({ ...page(await latest()), reachedEnd: true })
      }
    })
  )()

  disposers.push(unmount)

  return { fetcher, props, id, older, newer, around, latest, unmount }
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.render.mockResolvedValue(undefined)

  mocks.fetchMessage.mockImplementation(async ({ messageId }) => ({
    id: messageId
  }))
})

afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

describe('message fetch lifecycle', () => {
  it('keeps a removal received while a page is loading and accepts a later addition', async () => {
    const pending = Promise.withResolvers<string[]>()
    const { fetcher, older } = create()
    older.mockReturnValueOnce(pending.promise)
    const page = fetcher.init()
    fetcher.removeMessage('removed')
    pending.resolve(['before', 'removed', 'after'])
    await page

    expect(fetcher.messageIds.value).toEqual(['before', 'after'])

    await fetcher.addNewMessage('removed')

    expect(fetcher.messageIds.value).toEqual(['before', 'after', 'removed'])
  })

  it('discards a live message removed while its own lookup is pending', async () => {
    const pending = Promise.withResolvers<Message>()
    mocks.fetchMessage.mockReturnValueOnce(pending.promise)
    const { fetcher } = create()
    const live = fetcher.addNewMessage('removed')
    fetcher.removeMessage('removed')
    pending.resolve(message('removed'))
    await live

    expect(fetcher.messageIds.value).toEqual([])
  })

  it('puts a re-added folder member after the page that was loading before its removal', async () => {
    const pending = Promise.withResolvers<string[]>()
    const { fetcher, older } = create()
    older.mockReturnValueOnce(pending.promise)
    const page = fetcher.init()
    fetcher.removeMessage('removed')
    const added = fetcher.addNewMessage('removed')
    await flushPromises()
    pending.resolve(['before', 'removed', 'after'])
    await Promise.all([page, added])

    expect(fetcher.messageIds.value).toEqual(['before', 'after', 'removed'])
  })

  it('keeps live messages behind a queued reconnect catchUp', async () => {
    const rendering = Promise.withResolvers<void>()
    const catchUp = Promise.withResolvers<string[]>()
    const { fetcher, older, latest } = create()
    older.mockResolvedValueOnce(['initial'])
    latest.mockReturnValueOnce(catchUp.promise)

    mocks.render.mockImplementation((id: string) =>
      id === 'initial' ? rendering.promise : Promise.resolve()
    )

    const page = fetcher.init()
    await flushPromises()
    const live = fetcher.addNewMessage('live')
    await fetcher.requestCatchUp()
    await flushPromises()
    rendering.resolve()
    await flushPromises()

    expect(fetcher.isLoading.value).toBe(true)
    expect(fetcher.messageIds.value).toEqual(['initial'])

    catchUp.resolve(['missed'])
    await Promise.all([page, live])
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual(['initial', 'missed', 'live'])
  })

  it('appends live messages after a page that is still rendering', async () => {
    const rendering = Promise.withResolvers<void>()
    const { fetcher, older, newer } = create()
    older.mockResolvedValueOnce(['before'])
    await fetcher.onLoadOlderMessagesRequest()
    newer.mockResolvedValueOnce(['after'])

    mocks.render.mockImplementation((id: string) =>
      id === 'after' ? rendering.promise : Promise.resolve()
    )

    const pageRequest = fetcher.onLoadNewerMessagesRequest()
    await flushPromises()
    const liveRequest = fetcher.addNewMessage('live')
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual(['before'])

    rendering.resolve()
    await Promise.all([pageRequest, liveRequest])

    expect(fetcher.messageIds.value).toEqual(['before', 'after', 'live'])
  })

  it('discards live messages waiting for a page when reset invalidates the view', async () => {
    const pending = Promise.withResolvers<string[]>()
    const { fetcher, older } = create()
    older.mockReturnValueOnce(pending.promise)
    const pageRequest = fetcher.onLoadOlderMessagesRequest()
    const liveRequest = fetcher.addNewMessage('obsolete')
    await flushPromises()

    fetcher.reset()
    older.mockResolvedValueOnce(['current'])
    await fetcher.onLoadOlderMessagesRequest()
    await liveRequest
    pending.resolve(['obsolete-page'])
    await pageRequest

    expect(fetcher.messageIds.value).toEqual(['current'])
  })

  it('discards a latest-page response and queued catchUp after a jump in the same channel', async () => {
    const pending = Promise.withResolvers<string[]>()
    const { fetcher, props, older, around, latest } = create()
    older.mockReturnValueOnce(pending.promise)
    fetcher.init()
    await fetcher.requestCatchUp()

    props.entryMessageId = 'target'
    fetcher.reset()
    around.mockResolvedValueOnce(['before', 'target', 'after'])
    fetcher.init()
    await flushPromises()

    pending.resolve(['latest'])
    await flushPromises()

    expect(fetcher.messageIds.value).toEqual(['before', 'target', 'after'])
    expect(fetcher.lastLoadKind.value).toBe('around')
    expect(latest).not.toHaveBeenCalled()
    expect(mocks.render).not.toHaveBeenCalledWith(
      'latest',
      expect.any(Function)
    )
  })

  it('keeps the current request locked when a pre-reset request finishes', async () => {
    const first = Promise.withResolvers<string[]>()
    const second = Promise.withResolvers<string[]>()
    const { fetcher, older } = create()

    older.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    const oldRequest = fetcher.onLoadOlderMessagesRequest()
    fetcher.reset()
    const currentRequest = fetcher.onLoadOlderMessagesRequest()

    first.resolve(['old'])
    await oldRequest

    expect(fetcher.isLoading.value).toBe(true)
    expect(fetcher.messageIds.value).toEqual([])

    second.resolve(['current'])
    await currentRequest

    expect(fetcher.messageIds.value).toEqual(['current'])
    expect(fetcher.isLoading.value).toBe(false)
  })

  it('locks pagination during entry lookup and ignores an entry from an earlier jump', async () => {
    const entry = Promise.withResolvers<Message>()
    const { fetcher, props, older, newer, around } = create()
    mocks.fetchMessage.mockReturnValueOnce(entry.promise)
    const oldRequest = fetcher.onLoadAroundMessagesRequest('old-target')

    expect(fetcher.isLoading.value).toBe(true)

    await fetcher.onLoadOlderMessagesRequest()
    await fetcher.onLoadNewerMessagesRequest()
    await fetcher.onLoadAroundMessagesRequest('duplicate')

    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()
    expect(mocks.fetchMessage).toHaveBeenCalledTimes(1)

    props.entryMessageId = 'target'
    fetcher.reset()
    around.mockResolvedValueOnce(['target'])
    await fetcher.onLoadAroundMessagesRequest('target')
    entry.resolve({ id: 'old-target' } as Message)
    await oldRequest

    expect(around).toHaveBeenCalledTimes(1)
    expect(around.mock.calls[0]?.[0].id).toBe('target')
    expect(fetcher.messageIds.value).toEqual(['target'])
  })

  it('prevents later pages from overtaking a page that is still rendering', async () => {
    const rendering = Promise.withResolvers<void>()
    const { fetcher, older, newer } = create()
    older.mockResolvedValueOnce(['11/01'])
    await fetcher.onLoadOlderMessagesRequest()
    older.mockClear()

    newer
      .mockResolvedValueOnce(['11/02-target', '11/02-next'])
      .mockResolvedValueOnce(['11/06'])

    mocks.render.mockImplementation((id: string) =>
      id === '11/02-target' ? rendering.promise : Promise.resolve()
    )

    const first = fetcher.onLoadNewerMessagesRequest()
    await flushPromises()
    await fetcher.onLoadNewerMessagesRequest()
    await fetcher.onLoadOlderMessagesRequest()

    expect(newer).toHaveBeenCalledTimes(1)
    expect(older).not.toHaveBeenCalled()
    expect(fetcher.isLoading.value).toBe(true)

    rendering.resolve()
    await first
    await fetcher.onLoadNewerMessagesRequest()

    expect(fetcher.messageIds.value).toEqual([
      '11/01',
      '11/02-target',
      '11/02-next',
      '11/06'
    ])
  })

  it('discards a page if reset occurs during rendering', async () => {
    const rendering = Promise.withResolvers<void>()
    const { fetcher, older } = create()
    older.mockResolvedValueOnce(['old']).mockResolvedValueOnce(['current'])

    mocks.render.mockImplementation((id: string) =>
      id === 'old' ? rendering.promise : Promise.resolve()
    )

    const oldRequest = fetcher.onLoadOlderMessagesRequest()
    await flushPromises()
    fetcher.reset()
    await fetcher.onLoadOlderMessagesRequest()
    rendering.resolve()
    await oldRequest

    expect(fetcher.messageIds.value).toEqual(['current'])
  })

  it('runs a reconnect catchUp after the current page finishes', async () => {
    const pending = Promise.withResolvers<string[]>()
    const { fetcher, older, latest } = create()
    older.mockReturnValueOnce(pending.promise)
    latest.mockResolvedValueOnce(['new'])
    fetcher.init()
    await fetcher.requestCatchUp()
    await fetcher.requestCatchUp()

    expect(latest).not.toHaveBeenCalled()

    pending.resolve(['initial'])
    await flushPromises()

    expect(latest).toHaveBeenCalledTimes(1)
    expect(fetcher.messageIds.value).toEqual(['initial', 'new'])
    expect(fetcher.isLoading.value).toBe(false)
  })

  it('discards a live message that finishes rendering after reset', async () => {
    const rendering = Promise.withResolvers<void>()
    const { fetcher, older } = create()
    mocks.render.mockReturnValueOnce(rendering.promise)
    const pending = fetcher.addNewMessage('old')
    await flushPromises()

    expect(mocks.render).toHaveBeenCalledWith('old', expect.any(Function))

    fetcher.reset()
    older.mockResolvedValueOnce(['target'])
    await fetcher.onLoadOlderMessagesRequest()
    rendering.resolve()
    await pending

    expect(fetcher.messageIds.value).toEqual(['target'])
  })

  it('ignores responses after the view is unmounted', async () => {
    const pending = Promise.withResolvers<string[]>()
    const { fetcher, older, unmount } = create()
    older.mockReturnValueOnce(pending.promise)
    const request = fetcher.onLoadOlderMessagesRequest()
    unmount()
    disposers.pop()
    pending.resolve(['old'])
    await request

    expect(fetcher.messageIds.value).toEqual([])
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it('releases the loading lock when a request fails', async () => {
    const { fetcher, older } = create()
    older.mockRejectedValueOnce(new Error('offline'))

    await expect(fetcher.onLoadOlderMessagesRequest()).rejects.toThrow(
      'offline'
    )

    expect(fetcher.isLoading.value).toBe(false)

    older.mockResolvedValueOnce(['recovered'])
    await fetcher.onLoadOlderMessagesRequest()

    expect(fetcher.messageIds.value).toEqual(['recovered'])
  })
})

it('keeps arrival order when the first live message takes longer to prepare', async () => {
  const { fetcher, older } = create()
  older.mockResolvedValueOnce(['initial'])
  await fetcher.init()
  const pending = Promise.withResolvers<void>()
  mocks.render.mockImplementation((id: string) =>
    id === 'first' ? pending.promise : Promise.resolve()
  )

  const first = fetcher.addNewMessage('first')
  await flushPromises()
  const second = fetcher.addNewMessage('second')
  await flushPromises()
  expect(mocks.render).toHaveBeenCalledWith('second', expect.any(Function))
  expect(fetcher.messageIds.value).toEqual(['initial'])
  pending.resolve()
  await Promise.all([first, second])

  expect(fetcher.messageIds.value).toEqual(['initial', 'first', 'second'])
})
