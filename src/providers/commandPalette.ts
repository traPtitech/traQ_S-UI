import { computed, inject, InjectionKey, provide, reactive } from 'vue'
import store from '@/store'

const commandPaletteStoreSymbol: InjectionKey<CommandPaletteStore> = Symbol()

type CommandPaletteMode = 'command' | 'search'

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
}

const createCommandPaletteStore = () =>
  reactive<CommandPaletteStore>({
    mode: undefined,
    query: '',
    currentInput: ''
  })

export const provideCommandPaletteStore = () => {
  provide(commandPaletteStoreSymbol, createCommandPaletteStore())
}

const useCommandPaletteBase = () => {
  const commandPaletteStore = inject(commandPaletteStoreSymbol)
  if (!commandPaletteStore) {
    throw Error('useCommandPaletteStore() called without provider.')
  }

  const openCommandPalette = (mode: CommandPaletteMode, initialInput = '') => {
    commandPaletteStore.mode = mode
    commandPaletteStore.query = ''
    commandPaletteStore.currentInput = initialInput
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
    if (commandPaletteStore.currentInput) {
      store.commit.app.addSearchHistory(commandPaletteStore.currentInput)
    }
  }

  const historySuggestions = computed(() => store.state.app.searchHistories)

  return {
    commandPaletteStore,
    isCommandPaletteShown,
    openCommandPalette,
    closeCommandPalette,
    settleQuery,
    historySuggestions
  }
}

/** コマンドパレットを呼び出したいコンポーネントが用いる */
export const useCommandPaletteInvoker = () => {
  const { commandPaletteStore, openCommandPalette, closeCommandPalette } =
    useCommandPaletteBase()

  const mode = computed(() => commandPaletteStore.mode)

  return { mode, openCommandPalette, closeCommandPalette }
}
