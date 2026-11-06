import type { Message } from '@traptitech/traq'

import { flushPromises } from '@vue/test-utils'

import useSearchMessages from '/@/components/Main/CommandPalette/composables/useSearchMessages'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useMessagesStore } from '/@/store/entities/messages'

import { withSetup } from '../../../../testUtils'

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  parse: vi.fn(),
  params: vi.fn(),
  extend: vi.fn(),
  history: vi.fn(),
  set: vi.fn(),
  reset: vi.fn()
}))

vi.mock('/@/lib/apis', () => ({ default: { searchMessages: mocks.search } }))

vi.mock('/@/composables/searchMessage/useQueryParser', () => ({
  default: () => ({
    parseQuery: mocks.parse,
    toSearchMessageParam: (query: string, options: unknown) => {
      mocks.params(options)

      return [query]
    }
  })
}))

vi.mock('/@/store/entities/messages', async () => {
  const { ref } = await import('vue')
  const messagesMap = ref(new Map<string, Message>())

  return {
    useMessagesStore: () => ({
      messagesMap,
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
        })
    })
  }
})

vi.mock('/@/store/app/commandPalette', async () => {
  const { ref } = await import('vue')
  const query = ref('')

  const searchState = ref({
    currentSortKey: 'createdAt',
    currentPage: 0,
    totalCount: 0,
    searchResult: [] as Message[],
    hasCurrentResult: false
  })

  return {
    useCommandPalette: () => ({
      query,
      searchState,
      setSearchResult: mocks.set,
      resetPaging: mocks.reset,
      addSearchHistory: mocks.history
    })
  }
})

const disposers: Array<() => void> = []

const response = (id: string, totalHits = 1) => ({
  data: { hits: [{ id } as Message], totalHits }
})

const create = () => {
  const [search, { unmount }] = withSetup(useSearchMessages)()
  disposers.push(unmount)

  return search
}

beforeEach(() => {
  vi.resetAllMocks()
  useMessagesStore().messagesMap.value.clear()

  const { query, searchState } = useCommandPalette()
  query.value = ''

  searchState.value = {
    currentSortKey: 'createdAt',
    currentPage: 0,
    totalCount: 0,
    searchResult: [],
    hasCurrentResult: false
  }

  mocks.set.mockImplementation(
    (hasCurrentResult: boolean, messages: Message[], totalCount: number) => {
      Object.assign(searchState.value, {
        hasCurrentResult,
        searchResult: messages,
        totalCount
      })
    }
  )

  mocks.parse.mockImplementation(async (query: string) => ({
    normalizedQuery: query,
    queryObject: query
  }))
})

afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

it.each(['page', 'sort'] as const)(
  'retries an interrupted search after reopening with a different %s',
  async change => {
    const pending = Promise.withResolvers<ReturnType<typeof response>>()

    mocks.search
      .mockResolvedValueOnce(response('first', 40))
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(response('current'))

    const first = create()
    first.query.value = 'query'
    await first.executeSearchForCurrentPage()

    if (change === 'page') first.jumpToPage(1)
    else first.currentSortKey.value = 'updatedAt'

    const interrupted = first.executeSearchForCurrentPage()
    await flushPromises()
    disposers.pop()?.()
    const reopened = create()

    expect(reopened.hasCurrentResult.value).toBe(false)

    await reopened.executeSearchForCurrentPage()

    expect(mocks.params).toHaveBeenLastCalledWith({
      limit: 20,
      offset: change === 'page' ? 20 : 0,
      sort: change === 'sort' ? 'updatedAt' : 'createdAt'
    })

    expect(reopened.hasCurrentResult.value).toBe(true)
    expect(reopened.searchResult.value.map(message => message.id)).toEqual([
      'current'
    ])

    pending.resolve(response('obsolete'))
    await interrupted
    await flushPromises()

    expect(reopened.searchResult.value.map(message => message.id)).toEqual([
      'current'
    ])
  }
)

it('keeps a completed result reusable after reopening', async () => {
  mocks.search.mockResolvedValueOnce(response('completed'))
  const first = create()
  first.query.value = 'query'
  await first.executeSearchForCurrentPage()
  disposers.pop()?.()
  const reopened = create()

  expect(reopened.hasCurrentResult.value).toBe(true)
  expect(reopened.searchResult.value.map(message => message.id)).toEqual([
    'completed'
  ])
  expect(mocks.search).toHaveBeenCalledTimes(1)
})

it('shows current cached content after a live update replaces a search hit', async () => {
  mocks.search.mockResolvedValueOnce(response('current'))
  const search = create()
  search.query.value = 'query'
  await search.executeSearchForCurrentPage()
  useMessagesStore().messagesMap.value.set('current', {
    id: 'current',
    content: 'updated'
  } as Message)

  expect(search.searchResult.value[0]?.content).toBe('updated')
})

it('commits only the newest search to shared state and history', async () => {
  const pending = Promise.withResolvers<ReturnType<typeof response>>()

  mocks.search
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(response('current'))

  const search = create()
  search.query.value = 'old'
  const old = search.executeSearchForCurrentPage()
  await flushPromises()
  search.query.value = 'current'
  await search.executeSearchForCurrentPage()
  pending.resolve(response('old'))
  await old

  expect(mocks.extend).toHaveBeenCalledExactlyOnceWith([{ id: 'current' }])

  expect(mocks.set).toHaveBeenCalledExactlyOnceWith(
    true,
    [{ id: 'current' }],
    1
  )

  expect(mocks.history).toHaveBeenCalledExactlyOnceWith('current')
})

it('does not issue an obsolete search after asynchronous parsing', async () => {
  const parsed = Promise.withResolvers<{
    normalizedQuery: string
    queryObject: string
  }>()

  mocks.parse.mockReturnValueOnce(parsed.promise)
  mocks.search.mockResolvedValue(response('current'))
  const search = create()
  search.query.value = 'old'
  const old = search.executeSearchForCurrentPage()
  search.query.value = 'current'
  await search.executeSearchForCurrentPage()
  parsed.resolve({ normalizedQuery: 'old', queryObject: 'old' })
  await old

  expect(mocks.search).toHaveBeenCalledExactlyOnceWith('current', {
    signal: expect.any(AbortSignal)
  })
})

it('invalidates a pending search when the query is cleared', async () => {
  const pending = Promise.withResolvers<ReturnType<typeof response>>()
  mocks.search.mockReturnValueOnce(pending.promise)
  const search = create()
  search.query.value = 'old'
  const old = search.executeSearchForCurrentPage()
  await flushPromises()
  search.query.value = ''
  await search.executeSearchForCurrentPage()
  pending.resolve(response('old'))
  await old

  expect(mocks.reset).toHaveBeenCalledTimes(1)
  expect(mocks.set).not.toHaveBeenCalled()
  expect(search.fetchingSearchResult.value).toBe(false)
})

it('releases loading on failure and supports a subsequent search', async () => {
  mocks.search
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(response('current'))

  const search = create()
  search.query.value = 'first'

  await expect(search.executeSearchForCurrentPage()).rejects.toThrow('offline')

  expect(search.fetchingSearchResult.value).toBe(false)

  search.query.value = 'current'
  await search.executeSearchForCurrentPage()

  expect(mocks.set).toHaveBeenCalledTimes(1)
})
