import type { Message } from '@traptitech/traq'

import type { Ref } from 'vue'
import { computed, defineComponent, h, nextTick, ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'

import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import useMessageFetcher from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import { useStampsStore } from '/@/store/entities/stamps'

import { withSetup } from '../../../../testUtils'

vi.mock('/@/router', () => ({ isMessageScrollerRoute: () => true }))
vi.mock('vue-router', () => ({ useRoute: () => ({ name: 'channel' }) }))

vi.mock('/@/store/entities/stamps', async () => {
  const { ref } = await import('vue')
  const stampsMapFetched = ref(true)

  return { useStampsStore: () => ({ stampsMapFetched }) }
})

vi.mock('/@/store/ui/mainView', async () => {
  const { ref } = await import('vue')

  return { useMainViewStore: () => ({ lastScrollPosition: ref(0) }) }
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

const disposers: Array<() => void> = []

const create = async ({
  scrollHeight = 600,
  messageIds,
  entryMessageId,
  reachedLatest = false
}: {
  scrollHeight?: number
  messageIds?: Ref<string[]>
  entryMessageId?: Ref<string | undefined>
  reachedLatest?: boolean
} = {}) => {
  const geometry = { clientHeight: 600, scrollHeight }
  const entryHandlers = new Map<string, (relativePos: number) => void>()

  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(
    () => geometry.clientHeight
  )

  vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(
    () => geometry.scrollHeight
  )

  const pending = Promise.withResolvers<void>()

  const older = vi.fn(async () => {
    await pending.promise

    return { messages: [] as Message[], cursor: 0, reachedStart: true }
  })

  const newer = vi.fn(async () => {
    return {
      messages: [{ id: 'after' } as Message],
      cursor: 0,
      reachedEnd: true
    }
  })

  const catchUp = vi.fn(async () => ({
    messages: [] as Message[],
    cursor: 0,
    reachedEnd: true
  }))

  const around = vi.fn(async () => ({
    messages: (entryMessageId ? ['before', 'target', 'after'] : ['target']).map(
      id => ({ id }) as Message
    ),
    cursor: 0,
    reachedStart: false,
    reachedEnd: reachedLatest
  }))

  const onError = vi.fn()
  const [fetcher, { unmount }] = withSetup(() =>
    useMessageFetcher({
      source: computed(() => 'ch:channel'),
      entryMessageId: entryMessageId ?? computed(() => 'target'),
      initialCursor: () => 0,
      limit: 20,
      autoLoad: false,
      resolveMessage: async id => ({ id }) as Message,
      load: { older, newer, catchUp, around }
    })
  )()

  disposers.push(unmount)

  if (!entryMessageId) await fetcher.init()

  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            MessagesScroller,
            {
              messageIds: messageIds?.value ?? fetcher.messageIds.value,
              entryMessageId: entryMessageId?.value,
              hasReachedOldest: fetcher.hasReachedOldest.value,
              isCaughtUp: fetcher.isCaughtUp.value,
              isLoading: fetcher.isLoading.value,
              lastLoadKind: fetcher.lastLoadKind.value,

              onRequestLoadOlder: () => {
                void fetcher.onLoadOlderMessagesRequest().catch(onError)
              },

              onRequestLoadNewer: () => {
                void fetcher.onLoadNewerMessagesRequest().catch(onError)
              }
            },
            {
              default: ({
                messageId,
                onEntryMessageLoaded
              }: {
                messageId: string
                onEntryMessageLoaded: (relativePos: number) => void
              }) => {
                entryHandlers.set(messageId, onEntryMessageLoaded)

                return h('div', messageId)
              }
            }
          )
      }
    })
  )

  disposers.push(() => wrapper.unmount())
  const scroller = wrapper.findComponent(MessagesScroller)
  const root = scroller.element as HTMLElement

  root.getBoundingClientRect = () =>
    new DOMRect(0, 0, 800, geometry.clientHeight)

  root.scrollTo = vi.fn((optionsOrX?: ScrollToOptions | number, y?: number) => {
    const top =
      typeof optionsOrX === 'number' ? (y ?? 0) : (optionsOrX?.top ?? 0)

    root.scrollTop = Math.max(
      0,
      Math.min(top, geometry.scrollHeight - geometry.clientHeight)
    )
  })

  return {
    fetcher,
    scroller,
    root,
    geometry,
    older,
    newer,
    catchUp,
    around,
    pending,
    onError,

    positionEntry: (messageId: string, relativePos: number) => {
      const handler = entryHandlers.get(messageId)

      if (!handler) throw new Error(`Missing entry handler for ${messageId}`)

      handler(relativePos)
    }
  }
}

beforeEach(() => {
  useStampsStore().stampsMapFetched.value = true
})

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
  vi.restoreAllMocks()
})

describe('quoted message jumps', () => {
  it('releases entry positioning when the entry is deleted before rendering', async () => {
    useStampsStore().stampsMapFetched.value = false
    const entry = ref<string | undefined>('target')

    const { fetcher, scroller, older, pending } = await create({
      scrollHeight: 1800,
      entryMessageId: entry
    })

    await fetcher.init()
    fetcher.removeMessage('target')
    useStampsStore().stampsMapFetched.value = true
    await flushPromises()
    await scroller.trigger('scroll')

    expect(fetcher.messageIds.value).toEqual(['before', 'after'])
    expect(older).toHaveBeenCalledTimes(1)

    pending.resolve()
    await flushPromises()
  })

  it('releases entry positioning when a completed page does not contain the entry', async () => {
    const entry = ref<string | undefined>('target')

    const { fetcher, scroller, around, older, pending } = await create({
      scrollHeight: 1800,
      entryMessageId: entry
    })

    around.mockResolvedValueOnce({
      messages: [{ id: 'before' } as Message],
      cursor: 0,
      reachedStart: false,
      reachedEnd: false
    })

    await fetcher.init()
    await flushPromises()
    await scroller.trigger('scroll')

    expect(older).toHaveBeenCalledTimes(1)

    pending.resolve()
    await flushPromises()
  })

  it('retries the initial jump through manual pagination without retrying automatically', async () => {
    const entry = ref<string | undefined>('target')

    const { fetcher, scroller, around, older, newer, pending } = await create({
      scrollHeight: 1800,
      entryMessageId: entry
    })

    around.mockRejectedValueOnce(new Error('offline'))
    await expect(fetcher.init()).rejects.toThrow('offline')
    await flushPromises()

    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()

    await scroller.trigger('scroll')
    await flushPromises()

    expect(around).toHaveBeenCalledTimes(2)
    expect(fetcher.messageIds.value).toContain('target')

    pending.resolve()
    await flushPromises()
  })

  it('waits for the entry position before checking pagination bounds', async () => {
    const entry = ref<string | undefined>('target')

    const { fetcher, root, older, newer, positionEntry } = await create({
      scrollHeight: 1800,
      entryMessageId: entry
    })

    await fetcher.init()
    await flushPromises()

    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()

    positionEntry('target', 900)
    await flushPromises()

    expect(root.scrollTop).toBe(700)
    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()
  })

  it('fills a short viewport after the entry has been positioned', async () => {
    const entry = ref<string | undefined>('target')

    const { fetcher, older, newer, pending, positionEntry } = await create({
      scrollHeight: 600,
      entryMessageId: entry
    })

    await fetcher.init()
    await flushPromises()

    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()

    positionEntry('target', 200)
    await flushPromises()

    expect(older).toHaveBeenCalledTimes(1)
    expect(newer).not.toHaveBeenCalled()

    pending.resolve()
    await flushPromises()

    expect(newer).toHaveBeenCalledTimes(1)
  })

  it('waits for a new jump and ignores the previous entry callback', async () => {
    const entry = ref<string | undefined>('target')

    const { fetcher, root, older, newer, around, positionEntry } = await create(
      { scrollHeight: 1800, entryMessageId: entry }
    )

    await fetcher.init()
    await flushPromises()
    positionEntry('target', 900)
    await flushPromises()

    entry.value = 'next'
    fetcher.reset()

    around.mockResolvedValueOnce({
      messages: ['before', 'next', 'after'].map(id => ({ id }) as Message),
      cursor: 0,
      reachedStart: false,
      reachedEnd: false
    })

    await fetcher.init()
    await flushPromises()
    const previousPosition = root.scrollTop
    positionEntry('target', 1300)

    expect(root.scrollTop).toBe(previousPosition)
    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()

    positionEntry('next', 1100)
    await flushPromises()

    expect(root.scrollTop).toBe(900)
  })

  it('preserves the current position when a older page finishes after scrolling away from the top', async () => {
    const entry = ref<string | undefined>('target')

    const { fetcher, scroller, root, geometry, older, pending, positionEntry } =
      await create({ scrollHeight: 1800, entryMessageId: entry })

    older.mockImplementationOnce(async () => {
      await pending.promise

      return {
        messages: [{ id: 'older' } as Message],
        cursor: 0,
        reachedStart: true
      }
    })

    await fetcher.init()
    await flushPromises()
    positionEntry('target', 900)
    await flushPromises()

    root.scrollTop = 0
    await scroller.trigger('scroll')
    expect(older).toHaveBeenCalledTimes(1)

    root.scrollTop = 300
    geometry.scrollHeight = 2200
    pending.resolve()
    await flushPromises()

    expect(root.scrollTop).toBe(700)
  })

  it('does not overwrite the entry position when the stamp catalog finishes loading', async () => {
    useStampsStore().stampsMapFetched.value = false
    const entry = ref<string | undefined>('target')

    const { fetcher, root, older, positionEntry } = await create({
      scrollHeight: 1800,
      entryMessageId: entry
    })

    await fetcher.init()
    await flushPromises()
    useStampsStore().stampsMapFetched.value = true
    await nextTick()
    positionEntry('target', 900)
    await flushPromises()

    expect(root.scrollTop).toBe(700)
    expect(older).not.toHaveBeenCalled()
  })
})

describe('pagination after loading', () => {
  it('keeps following the bottom when a delayed new message is inserted before a later message', async () => {
    const ids = ref(['target', 'later'])
    const { root, geometry } = await create({
      scrollHeight: 1800,
      messageIds: ids,
      reachedLatest: true
    })
    root.scrollTop = 1200
    geometry.scrollHeight = 1900

    ids.value = ['target', 'earlier', 'later']
    await flushPromises()

    expect(root.scrollTop).toBe(1300)
  })

  it('updates the viewport height after an empty page changes the end separator', async () => {
    const { fetcher, root, geometry, pending } = await create({
      scrollHeight: 1800,
      reachedLatest: true
    })
    root.scrollTop = 1200

    const request = fetcher.onLoadOlderMessagesRequest()
    await flushPromises()
    geometry.scrollHeight = 1900
    pending.resolve()
    await request
    await flushPromises()

    geometry.scrollHeight = 2000
    await fetcher.addNewMessage('live')
    await flushPromises()

    expect(root.scrollTop).toBe(1200)
    expect(root.scrollTo).not.toHaveBeenCalled()
  })

  it('follows an in-place append to a reactive message ID array after catchUp', async () => {
    const ids = ref(['target'])
    const { fetcher, root, geometry } = await create({
      scrollHeight: 1800,
      messageIds: ids,
      reachedLatest: true
    })

    await fetcher.requestCatchUp()
    await flushPromises()
    root.scrollTop = 1200

    geometry.scrollHeight = 1900
    ids.value.push('live')
    await flushPromises()

    expect(fetcher.lastLoadKind.value).toBe('catchUp')
    expect(root.scrollTop).toBe(1300)
  })

  it.each([600, 1200])(
    'follows new messages after an empty catchUp only near the bottom (scrollTop: %i)',
    async scrollTop => {
      const { fetcher, root, geometry, catchUp } = await create({
        scrollHeight: 1800,
        reachedLatest: true
      })
      root.scrollTop = scrollTop

      await fetcher.requestCatchUp()
      await flushPromises()

      expect(catchUp).toHaveBeenCalledTimes(1)
      expect(fetcher.lastLoadKind.value).toBe('catchUp')

      geometry.scrollHeight = 1900
      await fetcher.addNewMessage('live')
      await flushPromises()

      expect(root.scrollTop).toBe(scrollTop === 1200 ? 1300 : 600)
    }
  )

  it('keeps the reading position when a newer page is appended at the bottom', async () => {
    const { fetcher, root, geometry, newer } = await create({
      scrollHeight: 1800
    })
    root.scrollTop = 1200

    newer.mockImplementationOnce(async () => {
      geometry.scrollHeight = 1900

      return {
        messages: [{ id: 'after' } as Message],
        cursor: 0,
        reachedEnd: true
      }
    })

    await fetcher.onLoadNewerMessagesRequest()
    await flushPromises()

    expect(fetcher.lastLoadKind.value).toBe('next')
    expect(root.scrollTop).toBe(1200)
    expect(root.scrollTo).not.toHaveBeenCalled()
  })

  it('keeps the viewport position when a live append creates a new ID array', async () => {
    const { fetcher, root, geometry } = await create({
      scrollHeight: 1800,
      reachedLatest: true
    })
    root.scrollTop = 600
    geometry.scrollHeight = 1900

    await fetcher.addNewMessage('live')

    await flushPromises()

    expect(root.scrollTop).toBe(600)
    expect(root.scrollTo).not.toHaveBeenCalled()
  })

  it('follows a live append when the viewport was already at the bottom', async () => {
    const { fetcher, root, geometry } = await create({
      scrollHeight: 1800,
      reachedLatest: true
    })
    root.scrollTop = 1200
    geometry.scrollHeight = 1900

    await fetcher.addNewMessage('live')

    await flushPromises()

    expect(root.scrollTop).toBe(1300)
  })

  it('loads the discarded newer page without another scroll when content fits the viewport', async () => {
    const { fetcher, scroller, older, newer, pending } = await create()
    await scroller.trigger('scroll')

    expect(scroller.emitted('requestLoadOlder')).toHaveLength(1)
    expect(scroller.emitted('requestLoadNewer')).toHaveLength(1)
    expect(older).toHaveBeenCalledTimes(1)
    expect(newer).not.toHaveBeenCalled()

    pending.resolve()
    await flushPromises()

    expect(newer).toHaveBeenCalledTimes(1)
    expect(older).toHaveBeenCalledTimes(1)
    expect(fetcher.messageIds.value).toEqual(['target', 'after'])
    expect(fetcher.hasReachedOldest.value).toBe(true)
    expect(fetcher.isCaughtUp.value).toBe(true)
    expect(fetcher.isLoading.value).toBe(false)
  })

  it('does not fetch another page after the user moves away from both ends', async () => {
    const { scroller, root, older, newer, pending } = await create({
      scrollHeight: 1800
    })
    await scroller.trigger('scroll')
    root.scrollTop = 600
    pending.resolve()
    await flushPromises()

    expect(root.scrollTop).toBe(600)
    expect(older).toHaveBeenCalledTimes(1)
    expect(newer).not.toHaveBeenCalled()
  })

  it('does not retry failed requests automatically', async () => {
    const { scroller, older, newer, onError } = await create()
    const error = new Error('offline')
    older.mockRejectedValueOnce(error)
    await scroller.trigger('scroll')
    await flushPromises()

    expect(onError).toHaveBeenCalledWith(error)
    expect(older).toHaveBeenCalledTimes(1)
    expect(newer).not.toHaveBeenCalled()
  })

  it('waits for the stamp catalog before filling the viewport', async () => {
    useStampsStore().stampsMapFetched.value = false
    const { fetcher, older, newer, pending } = await create()
    const request = fetcher.onLoadOlderMessagesRequest()
    await flushPromises()
    pending.resolve()
    await request
    await flushPromises()

    expect(newer).not.toHaveBeenCalled()

    useStampsStore().stampsMapFetched.value = true
    await flushPromises()

    expect(older).toHaveBeenCalledTimes(1)
    expect(newer).toHaveBeenCalledTimes(1)
    expect(fetcher.messageIds.value).toEqual(['target', 'after'])
  })

  it('does not page through messages while the scroller has no layout height', async () => {
    const { fetcher, geometry, older, newer, pending } = await create()
    geometry.clientHeight = 0
    geometry.scrollHeight = 0
    const request = fetcher.onLoadOlderMessagesRequest()
    await flushPromises()
    pending.resolve()
    await request
    await flushPromises()

    expect(older).toHaveBeenCalledTimes(1)
    expect(newer).not.toHaveBeenCalled()
  })
})

it.each(['latest', 'previous', 'next', 'catchUp', 'around'] as const)(
  'preserves reading position when two messages are removed after %s',
  async lastLoadKind => {
    const geometry = { clientHeight: 600, scrollHeight: 1800 }
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(
      () => geometry.clientHeight
    )
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(
      () => geometry.scrollHeight
    )
    const wrapper = mount(MessagesScroller, {
      props: {
        messageIds: ['a', 'b', 'c', 'd'],
        hasReachedOldest: true,
        isCaughtUp: true,
        lastLoadKind
      }
    })
    disposers.push(() => wrapper.unmount())
    const root = wrapper.element as HTMLElement
    root.scrollTop = 600
    root.scrollTo = vi.fn(
      (optionsOrX?: ScrollToOptions | number, y?: number) => {
        const top =
          typeof optionsOrX === 'number' ? (y ?? 0) : (optionsOrX?.top ?? 0)

        root.scrollTop = Math.max(
          0,
          Math.min(top, geometry.scrollHeight - geometry.clientHeight)
        )
      }
    )

    geometry.scrollHeight = 1600
    await wrapper.setProps({ messageIds: ['a', 'b'] })
    await flushPromises()

    expect(root.scrollTop).toBe(600)
  }
)
