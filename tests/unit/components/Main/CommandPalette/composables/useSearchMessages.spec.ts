import type { Message } from '@traptitech/traq'

import { flushPromises } from '@vue/test-utils'

import useSearchMessages from '/@/components/Main/CommandPalette/composables/useSearchMessages'
import { useCommandPalette } from '/@/store/app/commandPalette'

import { withSetup } from '../../../../testUtils'

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  extend: vi.fn(),
  error: vi.fn(),
  history: vi.fn()
}))

vi.mock('/@/lib/apis', () => ({ default: { searchMessages: mocks.search } }))

vi.mock('/@/store/entities/messages', () => ({
  useMessagesStore: () => ({ extendMessagesMap: mocks.extend })
}))

vi.mock('/@/store/ui/toast', () => ({
  useToastStore: () => ({ addErrorToast: mocks.error })
}))

vi.mock('/@/store/app/commandPalette', async () => {
  const { ref } = await import('vue')
  const query = ref('')

  const searchRequest = ref<{
    serializedQuery: string
    queryObject: { word?: string }
  }>()

  const searchState = ref({
    executed: false,
    searchResult: [],
    totalCount: 0,
    currentPage: 0,
    currentSortKey: 'createdAt'
  })

  return {
    useCommandPalette: () => ({
      query,
      searchRequest,
      searchState,
      addSearchHistory: mocks.history,

      setSearchResult: (executed: boolean, hits: never[], total: number) => {
        searchState.value.executed = executed
        searchState.value.searchResult = hits
        searchState.value.totalCount = total
      },

      resetPaging: () => {
        searchState.value.executed = false
        searchState.value.searchResult = []
        searchState.value.currentPage = 0
      }
    })
  }
})

type Response = { data: { hits: Message[]; totalHits: number } }

const response = (id: string): Response => ({
  data: {
    hits: [{ id, createdAt: '2026-01-01T00:00:00Z' } as Message],
    totalHits: 1
  }
})

const disposers: Array<() => void> = []

const create = () => {
  const [search, { unmount }] = withSetup(useSearchMessages)()
  disposers.push(unmount)

  return {
    ...search,

    dispose: () => {
      unmount()
      disposers.splice(disposers.indexOf(unmount), 1)
    }
  }
}

const run = (search: ReturnType<typeof create>, query: string) => {
  useCommandPalette().searchRequest.value = {
    serializedQuery: query,
    queryObject: { word: query }
  }

  return search.executeSearchForCurrentPage()
}

beforeEach(() => {
  Object.values(mocks).forEach(mock => mock.mockReset())

  const { searchState } = useCommandPalette()

  searchState.value = {
    executed: false,
    searchResult: [],
    totalCount: 0,
    currentPage: 0,
    currentSortKey: 'createdAt'
  }
})

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
})

describe('search request lifecycle', () => {
  it('ignores an older response that arrives after the latest result', async () => {
    const first = Promise.withResolvers<Response>()

    mocks.search
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(response('latest'))

    const search = create()
    const pending = run(search, 'first')
    await flushPromises()
    await run(search, 'second')
    first.resolve(response('stale'))
    await pending

    expect(search.searchResult.value.map(message => message.id)).toEqual([
      'latest'
    ])

    expect(mocks.extend).toHaveBeenCalledTimes(1)
    expect(search.fetchingSearchResult.value).toBe(false)
  })

  it('does not update shared state after the palette is disposed', async () => {
    const result = Promise.withResolvers<Response>()
    mocks.search.mockReturnValue(result.promise)
    const search = create()
    const pending = run(search, 'query')
    await flushPromises()
    search.dispose()
    result.resolve(response('late'))
    await pending

    expect(mocks.extend).not.toHaveBeenCalled()
    expect(useCommandPalette().searchState.value.executed).toBe(false)
  })

  it('invalidates a pending search when the query is cleared', async () => {
    const result = Promise.withResolvers<Response>()
    mocks.search.mockReturnValue(result.promise)
    const search = create()
    const pending = run(search, 'query')
    await flushPromises()
    await run(search, '')
    result.resolve(response('stale'))
    await pending

    expect(mocks.extend).not.toHaveBeenCalled()
    expect(search.fetchingSearchResult.value).toBe(false)
  })

  it('requires refetching the pending page when the palette is reopened', async () => {
    const nextPage = Promise.withResolvers<Response>()

    mocks.search
      .mockResolvedValueOnce(response('first-page'))
      .mockReturnValueOnce(nextPage.promise)

    const search = create()
    await run(search, 'query')

    expect(search.executed.value).toBe(true)

    search.currentPage.value = 1
    const pending = run(search, 'query')
    await flushPromises()
    search.dispose()
    const reopened = create()

    expect(reopened.executed.value).toBe(false)
    expect(reopened.currentPage.value).toBe(1)

    nextPage.resolve(response('ignored-page'))
    await pending

    expect(reopened.executed.value).toBe(false)
    expect(mocks.extend).toHaveBeenCalledTimes(1)
  })

  it('retains completed results when the palette is reopened', async () => {
    mocks.search.mockResolvedValue(response('completed'))
    const search = create()
    await run(search, 'query')
    search.dispose()
    const reopened = create()

    expect(reopened.executed.value).toBe(true)

    expect(reopened.searchResult.value.map(message => message.id)).toEqual([
      'completed'
    ])
  })

  it('clears loading when the API rejects a resolved request', async () => {
    mocks.search.mockRejectedValue(new Error('offline'))
    const search = create()
    await run(search, 'hello')
    expect(search.fetchingSearchResult.value).toBe(false)
    expect(mocks.error).toHaveBeenCalledOnce()
  })

  it('reuses the resolved conditions for paging and sorting', async () => {
    mocks.search.mockResolvedValue(response('page'))
    const search = create()
    await run(search, 'hello')
    const request = useCommandPalette().searchRequest.value
    search.currentPage.value = 1
    search.currentSortKey.value = '-createdAt'
    await search.executeSearchForCurrentPage()
    expect(useCommandPalette().searchRequest.value).toBe(request)
    expect(mocks.search.mock.calls[1]?.[0]).toBe('hello')
    expect(mocks.search.mock.calls[1]?.[14]).toBe(20)
    expect(mocks.search.mock.calls[1]?.[15]).toBe('-createdAt')
  })
})
