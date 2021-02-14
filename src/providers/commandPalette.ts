import { computed, inject, InjectionKey, provide, reactive } from 'vue'

const commandPaletteStoreSymbol: InjectionKey<CommandPaletteStore> = Symbol()

type CommandPaletteMode = 'command' | 'search'

export interface CommandPaletteStore {
  /**
   * 表示モード
   */
  mode: CommandPaletteMode | undefined

  /**
   * 現在の入力内容
   */
  query: string
}

const createCommandPaletteStore = () =>
  reactive<CommandPaletteStore>({
    mode: undefined,
    query: ''
  })

export const provideCommandPaletteStore = () => {
  provide(commandPaletteStoreSymbol, createCommandPaletteStore())
}

const useCommandPaletteBase = () => {
  const commandPaletteStore = inject(commandPaletteStoreSymbol)
  if (!commandPaletteStore) {
    throw Error('useCommandPaletteStore() called without provider.')
  }

  const openCommandPalette = (mode: CommandPaletteMode) => {
    commandPaletteStore.mode = mode
  }
  const closeCommandPalette = () => {
    commandPaletteStore.mode = undefined
    commandPaletteStore.query = ''
  }

  return {
    commandPaletteStore,
    openCommandPalette,
    closeCommandPalette
  }
}

/** ストアを使うコマンドパレット内のコンポーネントが用いる */
export const useCommandPaletteStore = () => {
  const {
    commandPaletteStore,
    openCommandPalette,
    closeCommandPalette
  } = useCommandPaletteBase()

  const isCommandPaletteShown = computed(
    () => commandPaletteStore.mode !== undefined
  )

  return {
    commandPaletteStore,
    isCommandPaletteShown,
    openCommandPalette,
    closeCommandPalette
  }
}

/** コマンドパレットを呼び出したいコンポーネントが用いる */
export const useCommandPaletteInvoker = () => {
  const { openCommandPalette } = useCommandPaletteBase()
  return { openCommandPalette }
}
