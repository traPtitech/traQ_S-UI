import { defineMutations } from 'direct-vuex'
import { S } from './state'
import { Toast, DEFAULT_TOAST_TIMEOUT, MAX_TOAST_COUNT } from '.'

let nextId = 0

export const mutations = defineMutations<S>()({
  addToast: (
    state,
    toast: Omit<Toast, 'timeout' | 'id'> & { timeout?: number }
  ) => {
    state.toasts.unshift({
      ...toast,
      timeout: toast.timeout ?? DEFAULT_TOAST_TIMEOUT,
      id: nextId
    })
    nextId++

    while (MAX_TOAST_COUNT < state.toasts.length) {
      state.toasts.pop()
    }
  },
  deleteToast: (state, id: number) => {
    const index = state.toasts.findIndex(toast => toast.id === id)
    state.toasts.splice(index, 1)
  },
  clearToasts: state => {
    state.toasts = []
  }
})
