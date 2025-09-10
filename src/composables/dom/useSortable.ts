import { onMounted, onUnmounted, shallowRef } from 'vue'

import Sortable from 'sortablejs'

type Options = Omit<Sortable.Options, 'store'> & {
  store?: {
    get?: (sortable: Sortable) => string[]
    set?: (sortable: Sortable) => void
  }
}

export const useSortable = ({ store, ...options }: Options = {}) => {
  const containerRef = shallowRef<HTMLElement | null>(null)
  let sortableInstance: Sortable | null = null

  const setupSortable = () => {
    if (sortableInstance) return
    if (!containerRef.value) return

    sortableInstance = Sortable.create(containerRef.value, {
      animation: 150,
      draggable: '.js-sortable-item',
      store: {
        get: store?.get ?? (() => []),
        set: store?.set ?? (() => void 0)
      },
      ...options
    })
  }

  const destroySortableInstance = () => {
    if (sortableInstance) {
      sortableInstance.destroy()
      sortableInstance = null
    }
  }

  onMounted(setupSortable)
  onUnmounted(destroySortableInstance)

  return { setupSortable, destroySortableInstance, containerRef }
}
