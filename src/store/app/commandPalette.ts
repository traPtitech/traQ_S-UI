import type { Message } from '@traptitech/traq'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref, toRefs } from 'vue'
import { getVuexData } from '/@/store/utils/migrateFromVuex'
import type { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'
import { isObjectAndHasKey } from '/@/lib/basic/object'
import { promisifyRequest } from 'idb-keyval'
import useQueryParser from '/@/composables/searchMessage/useQueryParser'

type CommandPaletteMode = 'command' | 'search'

type SearchState = {
  /**
   * 検索を実行したかどうか
   */
  executed: boolean

  /**
   * 検索結果
   */
  searchResult: Message[]

  /**
   * 項目の総数
   */
  totalCount: number

  /**
   * 現在表示しているページ、0-indexed
   */
  currentPage: number

  /**
   * 現在のソートキー
   */
  currentSortKey: SearchMessageSortKey
}

type IndexedDBState = {
  /** 検索履歴 新しい順に並ぶ */
  searchHistories: string[]
}

const useCommandPalettePinia = defineStore('app/commandPalette', () => {
  const { parseQuery } = useQueryParser()

  /** 表示モード */
  const mode = ref<CommandPaletteMode>()

  /** 決定された入力内容 */
  const query = ref('')

  /** 現在入力中の文字列 */
  const currentInput = ref('')

  /** スクロール位置 */
  const currentScrollTop = ref(0)

  /** 検索の状態 */
  const searchState = ref<SearchState>({
    executed: false,
    totalCount: 0,
    searchResult: [],
    currentPage: 0,
    currentSortKey: 'createdAt'
  })

  const initialValue: IndexedDBState = { searchHistories: [] }
  const [state] = useIndexedDbValue(
    'store/app/commandPalette',
    1,
    {
      // migrate from vuex
      1: async getStore => {
        const vuexStore = await getVuexData()
        if (!vuexStore) return
        if (!isObjectAndHasKey(vuexStore, 'app')) return
        if (!isObjectAndHasKey(vuexStore.app, 'messageSearchHistories')) return
        if (!(vuexStore.app.messageSearchHistories instanceof Array)) return
        const addReq = getStore().add(
          vuexStore.app.messageSearchHistories,
          'key'
        )
        await promisifyRequest(addReq)
      }
    },
    initialValue
  )

  const openCommandPalette = (
    newMode: CommandPaletteMode,
    initialInput = ''
  ) => {
    mode.value = newMode
    if (initialInput !== '') {
      currentInput.value = initialInput
    }
  }
  const closeCommandPalette = () => {
    mode.value = undefined
  }

  const isCommandPaletteShown = computed(() => mode.value !== undefined)

  const settleQuery = async () => {
    const { normalizedQuery } = await parseQuery(currentInput.value)
    currentInput.value = normalizedQuery
    query.value = normalizedQuery
  }

  const addSearchHistory = (newHistory: string) => {
    removeSearchHistory(newHistory)
    state.searchHistories.unshift(newHistory)
    if (state.searchHistories.length > 5) {
      state.searchHistories.pop()
    }
  }
  const removeSearchHistory = (oldHistory: string) => {
    const index = state.searchHistories.indexOf(oldHistory)
    if (index !== -1) {
      state.searchHistories.splice(index, 1)
    }
  }

  const setSearchResult = (
    executed: boolean,
    messages: Message[],
    totalCount: number
  ) => {
    searchState.value.executed = executed
    searchState.value.searchResult = messages
    searchState.value.totalCount = totalCount
  }

  const resetPaging = () => {
    searchState.value.executed = false
    searchState.value.searchResult = []
    searchState.value.totalCount = 0
    searchState.value.currentPage = 0
  }

  return {
    ...toRefs(state),
    mode,
    query,
    currentInput,
    currentScrollTop,
    searchState,
    isCommandPaletteShown,
    settleQuery,
    addSearchHistory,
    removeSearchHistory,
    openCommandPalette,
    closeCommandPalette,
    setSearchResult,
    resetPaging
  }
})

export const useCommandPalette = convertToRefsStore(useCommandPalettePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useCommandPalettePinia, import.meta.hot)
  )
}
