import { Message } from '@traptitech/traq'
import {
  computed,
  inject,
  InjectionKey,
  provide,
  reactive,
  readonly
} from 'vue'
import { SearchMessageSortKey } from '/@/lib/searchMessage/queryParser'
import store from '/@/store'

const commandPaletteStoreSymbol: InjectionKey<CommandPaletteStore> = Symbol()

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
      executed: false,
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
    if (initialInput !== '') {
      commandPaletteStore.currentInput = initialInput
    }
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

  const setCurrentInput = (currentInput: string) => {
    commandPaletteStore.currentInput = currentInput
  }

  const addCurrentInput = (input: string) => {
    commandPaletteStore.currentInput += input
  }

  const setSearchResult = (
    executed: boolean,
    messages: Message[],
    totalCount: number
  ) => {
    commandPaletteStore.searchState.executed = executed
    commandPaletteStore.searchState.searchResult = messages
    commandPaletteStore.searchState.totalCount = totalCount
  }

  const setCurrentSortKey = (sortKey: SearchMessageSortKey) => {
    commandPaletteStore.searchState.currentSortKey = sortKey
  }

  const setCurrentPage = (page: number) => {
    commandPaletteStore.searchState.currentPage = page
  }

  const setCurrentScrollTop = (scrollTop: number) => {
    commandPaletteStore.searchState.currentScrollTop = scrollTop
  }

  const resetPaging = () => {
    commandPaletteStore.searchState.executed = false
    commandPaletteStore.searchState.searchResult = []
    commandPaletteStore.searchState.totalCount = 0
    commandPaletteStore.searchState.currentPage = 0
  }

  const renderSearchResult = async () => {
    store.dispatch.entities.messages.extendMessagesMap(
      commandPaletteStore.searchState.searchResult
    )
    await Promise.all(
      commandPaletteStore.searchState.searchResult.map(message =>
        store.dispatch.domain.messagesView.renderMessageContent(message.id)
      )
    )
  }

  return {
    commandPaletteStore: readonly(commandPaletteStore),
    openCommandPalette,
    closeCommandPalette,

    isCommandPaletteShown,
    settleQuery,
    historySuggestions,
    removeHistorySuggestion,
    setCurrentInput,
    addCurrentInput,
    setSearchResult,
    setCurrentSortKey,
    setCurrentPage,
    setCurrentScrollTop,
    resetPaging,
    renderSearchResult
  }
}

/** コマンドパレットを呼び出したいコンポーネントが用いる */
export const useCommandPaletteInvoker = () => {
  const { commandPaletteStore, openCommandPalette, closeCommandPalette } =
    useCommandPaletteBase()

  const mode = computed(() => commandPaletteStore.mode)

  return { mode, openCommandPalette, closeCommandPalette }
}
