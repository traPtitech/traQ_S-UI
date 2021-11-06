import { ref, computed, Ref, DeepReadonly, toRefs } from 'vue'
import { Message } from '@traptitech/traq'
import apis from '/@/lib/apis'
import { compareDateString } from '/@/lib/basic/date'
import store from '/@/store'
import useQueryParer from '/@/use/searchMessage/queryParser'
import { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { useCommandPaletteStore } from '/@/providers/commandPalette'

const useSortMessages = (
  messages: Ref<DeepReadonly<Message[]>>,
  currentSortKey: Ref<SearchMessageSortKey>
) => {
  const sortedMessages = computed(() => {
    switch (currentSortKey.value) {
      case '-createdAt':
        return [...messages.value].sort((m1, m2) =>
          compareDateString(m1.createdAt, m2.createdAt)
        )
      case 'updatedAt':
        return [...messages.value].sort((m1, m2) =>
          compareDateString(m1.updatedAt, m2.updatedAt, true)
        )
      case '-updatedAt':
        return [...messages.value].sort((m1, m2) =>
          compareDateString(m1.updatedAt, m2.updatedAt)
        )
      default:
        return [...messages.value].sort((m1, m2) =>
          compareDateString(m1.createdAt, m2.createdAt, true)
        )
    }
  })
  return { sortedMessages }
}

const usePaging = (
  itemsPerPage: number,
  currentPage: Ref<number>,
  totalCount: Ref<number>,
  setCurrentPage: (page: number) => void
) => {
  /** 現在のオフセット */
  const currentOffset = computed(() => currentPage.value * itemsPerPage)

  /** 「n件目 - m件目 まで表示」に使う値、1-indexed*/
  const showingRange = computed(() => [
    currentOffset.value + 1,
    currentOffset.value + 1 + itemsPerPage
  ])

  const pageCount = computed(() => Math.ceil(totalCount.value / itemsPerPage))

  const jumpToPage = (page: number) => {
    if (totalCount.value <= 0) {
      return
    }
    setCurrentPage(Math.max(0, Math.min(page, pageCount.value - 1)))
  }

  return {
    currentOffset,
    showingRange,
    pageCount,
    jumpToPage
  }
}

const useSearchMessages = () => {
  const limit = 20
  const { parseQuery, toSearchMessageParam } = useQueryParer()
  const {
    setSearchResult,
    setCurrentSortKey,
    setCurrentPage,
    resetPaging,
    commandPaletteStore
  } = useCommandPaletteStore()

  const query = computed(() => commandPaletteStore.query)

  const currentSortKey = computed({
    get: () => commandPaletteStore.searchState.currentSortKey,
    set: sortKey => {
      setCurrentSortKey(sortKey)
    }
  })

  const { executed, searchResult, currentPage, totalCount } = toRefs(
    commandPaletteStore.searchState
  )

  const { sortedMessages } = useSortMessages(searchResult, currentSortKey)

  const { currentOffset, pageCount, showingRange, jumpToPage } = usePaging(
    limit,
    currentPage,
    totalCount,
    setCurrentPage
  )

  const fetchingSearchResult = ref(false)

  const fetchAndRenderMessagesOnCurrentPageBySearch = async (query: string) => {
    if (query === '') {
      resetPaging()
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

    setSearchResult(true, hits, res.data.totalHits ?? 0)
  }

  return {
    resetPaging,

    query,
    currentPage,
    totalCount,
    currentSortKey,
    searchResult: sortedMessages,
    executed,

    pageCount,
    showingRange,
    jumpToPage,

    fetchingSearchResult,
    executeSearchForCurrentPage: fetchAndRenderMessagesOnCurrentPageBySearch
  }
}

export default useSearchMessages
