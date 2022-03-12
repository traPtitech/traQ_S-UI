import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

const DEFAULT_TOAST_TIMEOUT = 1500
const MAX_TOAST_COUNT = 5

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

const useToastStorePinia = defineStore('ui/toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  const addToast = (toast: ToastOption) => {
    toasts.value.unshift({
      ...toast,
      timeout: toast.timeout ?? DEFAULT_TOAST_TIMEOUT,
      id: nextId
    })
    nextId++

    while (MAX_TOAST_COUNT < toasts.value.length) {
      toasts.value.pop()
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
    const index = toasts.value.findIndex(toast => toast.id === id)
    toasts.value.splice(index, 1)
  }

  const clearToasts = () => {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    addSuccessToast,
    addErrorToast,
    addInfoToast,
    deleteToast,
    clearToasts
  }
})

export const useToastStore = convertToRefsStore(useToastStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStorePinia, import.meta.hot))
}
