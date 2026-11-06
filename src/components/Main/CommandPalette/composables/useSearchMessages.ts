import type { Message } from '@traptitech/traq'

import type { DeepReadonly, Ref } from 'vue'
import { computed } from 'vue'

import useQueryParser from '/@/composables/searchMessage/useQueryParser'
import useLatestRequest from '/@/composables/utils/useLatestRequest'
import apis from '/@/lib/apis'
import { compareDateString } from '/@/lib/basic/date'
import type { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useMessagesStore } from '/@/store/entities/messages'

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

    currentPage.value = Math.max(0, Math.min(page, pageCount.value - 1))
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
  const { parseQuery, toSearchMessageParam } = useQueryParser()

  const { query, searchState, setSearchResult, resetPaging, addSearchHistory } =
    useCommandPalette()

  const { withMessageUpdates, isMessageDeleted, messagesMap } =
    useMessagesStore()

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

  // TODO: リファクタ
  const hasCurrentResult = computed(() => searchState.value.hasCurrentResult)
  const searchResult = computed(() =>
    hasCurrentResult.value
      ? searchState.value.searchResult
          .filter(message => !isMessageDeleted(message.id))
          .map(message => messagesMap.value.get(message.id) ?? message)
      : []
  )
  const totalCount = computed(() => searchState.value.totalCount)

  const { sortedMessages } = useSortMessages(searchResult, currentSortKey)

  const { currentOffset, pageCount, showingRange, jumpToPage } = usePaging(
    limit,
    currentPage,
    totalCount
  )

  const search = useLatestRequest({
    source: () => ({
      query: query.value,
      offset: currentOffset.value,
      sort: currentSortKey.value
    }),

    autoLoad: false,

    fetch: ({ query, offset, sort }, signal) =>
      withMessageUpdates(async cacheMessages => {
        const { normalizedQuery, queryObject } = await parseQuery(query)
        signal.throwIfAborted()

        const { data } = await apis.searchMessages(
          ...toSearchMessageParam(queryObject, { limit, offset, sort }),
          { signal }
        )

        return {
          ...data,
          hits: cacheMessages(data.hits),
          normalizedQuery
        }
      }, signal),

    onSuccess: ({ hits, totalHits, normalizedQuery }) => {
      addSearchHistory(normalizedQuery)
      setSearchResult(true, hits, totalHits)
    }
  })

  const executeSearchForCurrentPage = async () => {
    if (query.value === '') {
      search.reset()
      resetPaging()

      return
    }

    searchState.value.hasCurrentResult = false
    await search.execute()
  }

  return {
    resetPaging,

    query,
    currentPage,
    totalCount,
    currentSortKey,
    searchResult: sortedMessages,
    hasCurrentResult,

    pageCount,
    showingRange,
    jumpToPage,

    fetchingSearchResult: search.isLoading,
    searchError: search.error,
    executeSearchForCurrentPage
  }
}

export default useSearchMessages
