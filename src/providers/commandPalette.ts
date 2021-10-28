import { Message } from '@traptitech/traq'
import { computed, inject, InjectionKey, provide, reactive } from 'vue'
import { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import store from '/@/store'

const commandPaletteStoreSymbol: InjectionKey<CommandPaletteStore> = Symbol()

type CommandPaletteMode = 'command' | 'search'

type SearchState = {
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

  /**
   * スクロール位置
   */
  currentScrollTop: number
}

export interface CommandPaletteStore {
  /**
   * 表示モード
   */
  mode: CommandPaletteMode | undefined

  /**
   * 決定された入力内容
   */
  query: string

  /**
   * 現在入力中の文字列
   */
  currentInput: string

  /**
   * 検索の状態
   */
  searchState: SearchState
}

const createCommandPaletteStore = () =>
  reactive<CommandPaletteStore>({
    mode: undefined,
    query: '',
    currentInput: '',
    searchState: {
      totalCount: 0,
      searchResult: [],
      currentPage: 0,
      currentSortKey: 'createdAt',
      currentScrollTop: 0
    }
  })

export const provideCommandPaletteStore = () => {
  provide(commandPaletteStoreSymbol, createCommandPaletteStore())
}

const useCommandPaletteBase = () => {
  const commandPaletteStore = inject(commandPaletteStoreSymbol)
  if (!commandPaletteStore) {
    throw new Error('useCommandPaletteStore() called without provider.')
  }

  const openCommandPalette = (mode: CommandPaletteMode, initialInput = '') => {
    commandPaletteStore.mode = mode
  }
  const closeCommandPalette = () => {
    commandPaletteStore.mode = undefined
  }

  return {
    commandPaletteStore,
    openCommandPalette,
    closeCommandPalette
  }
}

/** ストアを使うコマンドパレット内のコンポーネントが用いる */
export const useCommandPaletteStore = () => {
  const { commandPaletteStore, openCommandPalette, closeCommandPalette } =
    useCommandPaletteBase()

  const isCommandPaletteShown = computed(
    () => commandPaletteStore.mode !== undefined
  )

  const settleQuery = () => {
    commandPaletteStore.query = commandPaletteStore.currentInput
    if (commandPaletteStore.currentInput !== '') {
      store.commit.app.addSearchHistory(commandPaletteStore.currentInput)
    }
  }

  const historySuggestions = computed(
    () => store.state.app.messageSearchHistories
  )

  const removeHistorySuggestion = (oldHistory: string) => {
    store.commit.app.removeSearchHistory(oldHistory)
  }

  const setSearchResult = (messages: Message[]) => {
    commandPaletteStore.searchState.searchResult = messages
  }

  const setTotalCount = (totalCount: number) => {
    commandPaletteStore.searchState.totalCount = totalCount
  }

  const setCurrentSortKey = (sortKey: SearchMessageSortKey) => {
    commandPaletteStore.searchState.currentSortKey = sortKey
  }

  const setCurrentPage = (page: number) => {
    commandPaletteStore.searchState.currentPage = page
  }

  const resetPaging = () => {
    commandPaletteStore.searchState.currentPage = 0
    commandPaletteStore.searchState.searchResult = []
    commandPaletteStore.searchState.totalCount = 0
  }

  const setCurrentScrollTop = (scrollTop: number) => {
    commandPaletteStore.searchState.currentScrollTop = scrollTop
  }

  return {
    commandPaletteStore,
    isCommandPaletteShown,
    openCommandPalette,
    closeCommandPalette,
    settleQuery,
    historySuggestions,
    removeHistorySuggestion,
    setSearchResult,
    setTotalCount,
    setCurrentSortKey,
    setCurrentPage,
    resetPaging,
    setCurrentScrollTop
  }
}

/** コマンドパレットを呼び出したいコンポーネントが用いる */
export const useCommandPaletteInvoker = () => {
  const { commandPaletteStore, openCommandPalette, closeCommandPalette } =
    useCommandPaletteBase()

  const mode = computed(() => commandPaletteStore.mode)

  return { mode, openCommandPalette, closeCommandPalette }
}
