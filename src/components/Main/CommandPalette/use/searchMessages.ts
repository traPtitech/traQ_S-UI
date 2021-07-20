import { ref, computed, readonly, Ref } from 'vue'
import { Message } from '@traptitech/traq'
import apis from '/@/lib/apis'
import { compareDateString } from '/@/lib/date'
import store from '/@/store'
import useQueryParer, {
  SearchMessageSortKey
} from '/@/use/searchMessage/queryParser'

const useSortMessages = (
  messages: Ref<Message[]>,
  currentSortKey: Ref<SearchMessageSortKey>
) => {
  const sortedMessages = computed(() => {
    switch (currentSortKey.value) {
      case '-createdAt':
        return messages.value.sort((m1, m2) =>
          compareDateString(m1.createdAt, m2.createdAt)
        )
      case 'updatedAt':
        return messages.value.sort((m1, m2) =>
          compareDateString(m1.updatedAt, m2.updatedAt, true)
        )
      case '-updatedAt':
        return messages.value.sort((m1, m2) =>
          compareDateString(m1.updatedAt, m2.updatedAt)
        )
      default:
        return messages.value.sort((m1, m2) =>
          compareDateString(m1.createdAt, m2.createdAt, true)
        )
    }
  })
  return { sortedMessages }
}

const usePaging = (itemsPerPage: number) => {
  /** 現在表示しているページ、0-indexed */
  const currentPage = ref(0)

  /** 項目の総数 */
  const totalCount = ref(0)

  /** 現在のオフセット */
  const currentOffset = computed(() => currentPage.value * itemsPerPage)

  /** 「n件目 - m件目 まで表示」に使う値、1-indexed*/
  const showingRange = computed(() => [
    currentOffset.value + 1,
    currentOffset.value + 1 + itemsPerPage
  ])

  const pageCount = computed(() => Math.ceil(totalCount.value / itemsPerPage))

  const resetPaging = () => {
    currentPage.value = 0
    totalCount.value = 0
  }
  const jumpToPage = (page: number) => {
    if (totalCount.value <= 0) {
      return
    }
    currentPage.value = Math.max(0, Math.min(page, pageCount.value - 1))
  }

  return {
    currentPage: readonly(currentPage),
    currentOffset,
    totalCount,
    pageCount,
    showingRange,
    resetPaging,
    jumpToPage
  }
}

const useSearchMessages = () => {
  const limit = 20
  const { parseQuery, toSearchMessageParam } = useQueryParer()

  const {
    currentPage,
    currentOffset,
    totalCount,
    pageCount,
    showingRange,
    resetPaging,
    jumpToPage
  } = usePaging(limit)

  const currentSortKey = ref<SearchMessageSortKey>('createdAt')
  const fetchingSearchResult = ref(false)

  const searchResult = ref<Message[]>([])
  const { sortedMessages } = useSortMessages(searchResult, currentSortKey)

  const fetchAndRenderMessagesOnCurrentPageBySearch = async (query: string) => {
    if (query === '') {
      resetPaging()
      searchResult.value = []
      return
    }

    fetchingSearchResult.value = true
    const queryObject = await parseQuery(query)
    const option = {
      limit,
      offset: currentOffset.value,
      sort: currentSortKey.value
    }
    const res = await apis.searchMessages(
      ...toSearchMessageParam(queryObject, option)
    )
    const hits = res.data.hits ?? []
    store.dispatch.entities.messages.extendMessagesMap(hits)
    await Promise.all(
      hits.map(message =>
        store.dispatch.domain.messagesView.renderMessageContent(message.id)
      )
    )
    fetchingSearchResult.value = false

    totalCount.value = res.data.totalHits ?? 0
    searchResult.value = res.data.hits ?? []
  }

  return {
    executeSearchForCurrentPage: fetchAndRenderMessagesOnCurrentPageBySearch,
    fetchingSearchResult,
    searchResult: sortedMessages,
    currentPage,
    totalCount: readonly(totalCount),
    pageCount,
    showingRange,
    resetPaging,
    jumpToPage,
    currentSortKey
  }
}

export default useSearchMessages
