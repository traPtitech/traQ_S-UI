import type { Message } from '@traptitech/traq'

import type { DeepReadonly, Ref } from 'vue'
import { computed, onScopeDispose, ref } from 'vue'

import apis from '/@/lib/apis'
import { compareDateString } from '/@/lib/basic/date'
import {
  type SearchMessageSortKey,
  toSearchMessageParam
} from '/@/lib/searchMessage/queryParser'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useMessagesStore } from '/@/store/entities/messages'
import { useToastStore } from '/@/store/ui/toast'

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
  totalCount: Ref<number>
) => {
  /** 現在のオフセット */
  const currentOffset = computed(() => currentPage.value * itemsPerPage)

  const pageCount = computed(() => Math.ceil(totalCount.value / itemsPerPage))

  const jumpToPage = (page: number) => {
    if (totalCount.value <= 0) {
      return
    }

    currentPage.value = Math.max(0, Math.min(page, pageCount.value - 1))
  }

  return {
    currentOffset,
    pageCount,
    jumpToPage
  }
}

const useSearchMessages = () => {
  const limit = 20

  const {
    query,
    searchRequest,
    searchState,
    setSearchResult,
    resetPaging,
    addSearchHistory
  } = useCommandPalette()

  const { extendMessagesMap } = useMessagesStore()
  const { addErrorToast } = useToastStore()

  const currentSortKey = computed({
    get: () => searchState.value.currentSortKey,
    set: sortKey => {
      searchState.value.currentSortKey = sortKey
    }
  })

  const currentPage = computed({
    get: () => searchState.value.currentPage,
    set: page => {
      searchState.value.currentPage = page
    }
  })

  const executed = computed(() => searchState.value.executed)
  const searchResult = computed(() => searchState.value.searchResult)
  const totalCount = computed(() => searchState.value.totalCount)

  const { sortedMessages } = useSortMessages(searchResult, currentSortKey)

  const { currentOffset, pageCount, jumpToPage } = usePaging(
    limit,
    currentPage,
    totalCount
  )

  const fetchingSearchResult = ref(false)
  let requestId = 0

  onScopeDispose(() => {
    requestId++
    if (fetchingSearchResult.value) searchState.value.executed = false
  })

  const fetchAndRenderMessagesOnCurrentPageBySearch = async () => {
    const request = searchRequest.value
    const id = ++requestId

    if (!request?.serializedQuery) {
      fetchingSearchResult.value = false
      resetPaging()

      return
    }

    fetchingSearchResult.value = true

    const option = {
      limit,
      offset: currentOffset.value,
      sort: currentSortKey.value
    }

    try {
      const { serializedQuery, queryObject } = request

      addSearchHistory(serializedQuery)

      const {
        data: { hits, totalHits }
      } = await apis.searchMessages(
        ...toSearchMessageParam(queryObject, option)
      )

      if (id !== requestId) return

      extendMessagesMap(hits)
      setSearchResult(true, hits, totalHits)
    } catch {
      if (id === requestId) addErrorToast('メッセージの検索に失敗しました')
    } finally {
      if (id === requestId) fetchingSearchResult.value = false
    }
  }

  return {
    resetPaging,

    query,
    searchRequest,
    currentPage,
    totalCount,
    currentSortKey,
    searchResult: sortedMessages,
    executed,

    pageCount,
    jumpToPage,

    fetchingSearchResult,
    executeSearchForCurrentPage: fetchAndRenderMessagesOnCurrentPageBySearch
  }
}

export default useSearchMessages
