import { provide, inject, reactive, computed, readonly } from 'vue'
import { MessageId } from '@/types/entity-ids'

const MessageContextMenuStoreSymbol = Symbol()

interface MessageContextMenuStore {
  target?: MessageId
  position: { x: number; y: number }
  isMinimum: boolean
}

const createMessageContextMenuStore = () => {
  return reactive<MessageContextMenuStore>({
    target: undefined,
    position: { x: 0, y: 0 },
    isMinimum: false
  })
}

export const provideMessageContextMenuStore = () => {
  provide(MessageContextMenuStoreSymbol, createMessageContextMenuStore())
}

const useMessageContextMenuStoreBase = () => {
  const messageContextMenuStore = inject<MessageContextMenuStore>(
    MessageContextMenuStoreSymbol
  )
  if (!messageContextMenuStore) {
    throw new Error('useMessageContextMenuStore() was called without provider.')
  }

  const isShown = computed(() => messageContextMenuStore.target !== undefined)

  const closeContextMenu = () => {
    messageContextMenuStore.position = { x: 0, y: 0 }
    messageContextMenuStore.target = undefined
    messageContextMenuStore.isMinimum = false
  }

  return { messageContextMenuStore, isShown, closeContextMenu }
}

export const useMessageContextMenuStore = () => {
  const {
    messageContextMenuStore,
    isShown,
    closeContextMenu
  } = useMessageContextMenuStoreBase()

  return {
    state: readonly(messageContextMenuStore),
    isShown,
    closeContextMenu
  }
}

type Point = {
  x: number
  y: number
}

export const useMessageContextMenuInvoker = (props: {
  messageId: MessageId
  isMinimum: boolean
}) => {
  const {
    messageContextMenuStore,
    isShown,
    closeContextMenu
  } = useMessageContextMenuStoreBase()

  const openContextMenu = ({ x, y }: Point) => {
    messageContextMenuStore.target = props.messageId
    messageContextMenuStore.position = { x, y }
    messageContextMenuStore.isMinimum = props.isMinimum
  }

  const toggleContextMenu = (point: Point) => {
    if (isShown.value) {
      closeContextMenu()
    } else {
      openContextMenu(point)
    }
  }

  return {
    openContextMenu,
    toggleContextMenu,
    closeContextMenu
  }
}
