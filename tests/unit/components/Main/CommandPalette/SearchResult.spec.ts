import type { Message } from '@traptitech/traq'

import type { PropType } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'

import boolAttr from '/@/bool-attr'
import SearchResult from '/@/components/Main/CommandPalette/SearchResult.vue'
import { useCommandPalette } from '/@/store/app/commandPalette'

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  deleted: new Set<string>()
}))

vi.mock('/@/components/UI/PopupSelector.vue', () => ({
  default: { name: 'PopupSelector', render: () => null }
}))

vi.mock('/@/lib/apis', () => ({ default: { searchMessages: mocks.search } }))

vi.mock('/@/composables/searchMessage/useQueryParser', () => ({
  default: () => ({
    parseQuery: async (query: string) => ({
      normalizedQuery: query,
      queryObject: query
    }),
    toSearchMessageParam: (query: string) => [query]
  })
}))

vi.mock('/@/store/entities/messages', async () => {
  const { reactive } = await import('vue')
  mocks.deleted = reactive(new Set<string>())

  return {
    useMessagesStore: () => ({
      messagesMap: { value: new Map<string, Message>() },
      isMessageDeleted: (messageId: string) => mocks.deleted.has(messageId),
      withMessageUpdates: <T>(
        read: (
          cacheMessages: (messages: readonly Message[]) => Message[]
        ) => Promise<T>,
        signal?: AbortSignal
      ) =>
        read(messages => {
          signal?.throwIfAborted()
          return [...messages]
        })
    })
  }
})

vi.mock('/@/store/app/commandPalette', async () => {
  const { ref } = await import('vue')
  const query = ref('query')

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

      setSearchResult: (
        hasCurrentResult: boolean,
        searchResult: Message[],
        totalCount: number
      ) => {
        Object.assign(searchState.value, {
          hasCurrentResult,
          searchResult,
          totalCount
        })
      },

      resetPaging: vi.fn(),
      addSearchHistory: vi.fn(),
      closeCommandPalette: vi.fn()
    })
  }
})

vi.mock('/@/composables/useOpenLink', () => ({
  useOpenLink: () => ({ openLink: vi.fn() })
}))

vi.mock('/@/router', () => ({ constructMessagesPath: vi.fn() }))

vi.mock(
  '/@/components/Main/CommandPalette/composables/useKeepScrollPosition',
  () => ({
    default: () => ({ didRender: vi.fn(), noRestore: vi.fn() })
  })
)

vi.mock(
  '/@/components/Main/CommandPalette/SearchResultMessageElement.vue',
  async () => {
    const { defineComponent, h } = await import('vue')

    return {
      default: defineComponent({
        props: {
          message: { type: Object as PropType<Message>, required: true }
        },
        setup: props => () => h('div', props.message.id)
      })
    }
  }
)

const disposers: Array<() => void> = []

const response = (id: string) => ({
  data: { hits: [{ id } as Message], totalHits: 40 }
})

beforeEach(() => {
  vi.resetAllMocks()
  mocks.deleted.clear()
  const { query, searchState } = useCommandPalette()
  query.value = 'query'

  searchState.value = {
    currentSortKey: 'createdAt',
    currentPage: 0,
    totalCount: 0,
    searchResult: [],
    hasCurrentResult: false
  }
})

afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

it('can return to the previous page after the only result on the final page is deleted', async () => {
  const firstPage = {
    data: { hits: [{ id: 'first' } as Message], totalHits: 21 }
  }
  mocks.search
    .mockResolvedValueOnce(firstPage)
    .mockResolvedValueOnce({
      data: { hits: [{ id: 'last' } as Message], totalHits: 21 }
    })
    .mockResolvedValueOnce(firstPage)
  const wrapper = mount(SearchResult, {
    global: {
      plugins: [boolAttr],
      stubs: { AIcon: true, PopupSelector: true, LoadingSpinner: true }
    }
  })
  disposers.push(() => wrapper.unmount())
  await flushPromises()
  await wrapper.get('[data-direction="next"]').trigger('click')
  await flushPromises()

  mocks.deleted.add('last')
  await flushPromises()
  expect(wrapper.text()).toContain(
    'このページに表示できるメッセージはありません'
  )

  await wrapper.get('[data-direction="previous"]').trigger('click')
  await flushPromises()

  expect(wrapper.text()).toContain('first')
  expect(wrapper.text()).toContain('1 / 2 ページ')
})

it('does not show page navigation when the entire query has no results', async () => {
  mocks.search.mockResolvedValueOnce({ data: { hits: [], totalHits: 0 } })
  const wrapper = mount(SearchResult, {
    global: {
      plugins: [boolAttr],
      stubs: { AIcon: true, PopupSelector: true, LoadingSpinner: true }
    }
  })
  disposers.push(() => wrapper.unmount())
  await flushPromises()

  expect(wrapper.text()).toContain('見つかりませんでした')
  expect(wrapper.find('[data-direction="previous"]').exists()).toBe(false)
  expect(wrapper.find('[data-direction="next"]').exists()).toBe(false)
})

it('shows a retryable error instead of the previous page after a next-page failure', async () => {
  mocks.search
    .mockResolvedValueOnce(response('first-page-message'))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(response('second-page-message'))

  const wrapper = mount(SearchResult, {
    global: {
      plugins: [boolAttr],
      stubs: { AIcon: true, PopupSelector: true, LoadingSpinner: true }
    }
  })

  disposers.push(() => wrapper.unmount())
  await flushPromises()

  expect(wrapper.text()).toContain('first-page-message')
  expect(wrapper.text()).toContain('1 / 2 ページ')
  await wrapper.get('[data-direction="next"]').trigger('click')
  await flushPromises()

  expect(wrapper.find('[data-direction="next"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('first-page-message')
  expect(wrapper.get('[role="alert"]').text()).toContain('検索に失敗しました')

  await wrapper.get('button').trigger('click')
  await flushPromises()

  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.text()).toContain('second-page-message')
  expect(wrapper.text()).toContain('2 / 2 ページ')
})
