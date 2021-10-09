import {
  provide,
  inject,
  reactive,
  computed,
  readonly,
  InjectionKey
} from 'vue'
import { MessageId } from '/@/types/entity-ids'
import { Point } from '/@/lib/basic/point'

const messageContextMenuStoreSymbol: InjectionKey<MessageContextMenuStore> =
  Symbol()

interface MessageContextMenuStore {
  target?: MessageId
  position: Point
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
  provide(messageContextMenuStoreSymbol, createMessageContextMenuStore())
}

const useMessageContextMenuStoreBase = () => {
  const messageContextMenuStore = inject(messageContextMenuStoreSymbol)
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
  const { messageContextMenuStore, isShown, closeContextMenu } =
    useMessageContextMenuStoreBase()

  return {
    state: readonly(messageContextMenuStore),
    isShown,
    closeContextMenu
  }
}

export const useMessageContextMenuInvoker = (props: {
  messageId: MessageId
  isMinimum: boolean
}) => {
  const { messageContextMenuStore, isShown, closeContextMenu } =
    useMessageContextMenuStoreBase()

  const isThisContextMenuShown = computed(
    () => messageContextMenuStore.target === props.messageId
  )

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
    isThisContextMenuShown,
    openContextMenu,
    toggleContextMenu,
    closeContextMenu
  }
}
