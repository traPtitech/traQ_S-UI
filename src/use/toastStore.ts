import { provide, inject, reactive, computed } from 'vue'

const DEFAULT_TOAST_TIMEOUT = 1500
const MAX_TOAST_COUNT = 5

const ToastStoreSymbol = Symbol()

interface ToastStore {
  toasts: Toast[]
  nextId: number
}

export interface Toast {
  /**
   * 表示タイプ
   */
  type: 'success' | 'error' | 'info'
  /**
   * 表示する文字
   */
  text: string
  /**
   * 表示する時間 (ms)
   */
  timeout: number
  /**
   * クリック時の挙動
   *
   * デフォルトはトーストの削除
   */
  onClick?: () => unknown
  /**
   * 自動付与されるid
   */
  id: number
}

type ToastOption = Readonly<
  Omit<Toast, 'timeout' | 'id'> & { timeout?: number }
>

const createToastStore = () => {
  return reactive<ToastStore>({
    toasts: [],
    nextId: 0
  })
}

export const provideToastStore = () => {
  provide(ToastStoreSymbol, createToastStore())
}

const useToastStore = () => {
  const toastStore = inject<ToastStore>(ToastStoreSymbol)
  if (!toastStore) {
    throw new Error('useToastStore() was called without provider.')
  }

  const addToast = (toast: ToastOption) => {
    toastStore.toasts.unshift({
      ...toast,
      timeout: toast.timeout ?? DEFAULT_TOAST_TIMEOUT,
      id: toastStore.nextId
    })
    toastStore.nextId++

    while (MAX_TOAST_COUNT < toastStore.toasts.length) {
      toastStore.toasts.pop()
    }
  }

  const addSuccessToast = (text: string) => {
    addToast({ type: 'success', text })
  }
  const addErrorToast = (text: string) => {
    addToast({ type: 'error', text })
  }
  const addInfoToast = (text: string) => {
    addToast({ type: 'info', text })
  }

  const deleteToast = (id: number) => {
    const index = toastStore.toasts.findIndex(toast => toast.id === id)
    toastStore.toasts.splice(index, 1)
  }

  const clearToasts = () => {
    toastStore.toasts = []
  }

  return {
    toasts: computed(() => toastStore.toasts),
    addToast,
    addSuccessToast,
    addErrorToast,
    addInfoToast,
    deleteToast,
    clearToasts
  }
}

export default useToastStore
