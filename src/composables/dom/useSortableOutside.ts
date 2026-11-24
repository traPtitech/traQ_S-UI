import { type Ref, computed, watch } from 'vue'

import { useEventListener } from '@vueuse/core'
import type Sortable from 'sortablejs'

type PointerPosition = Pick<MouseEvent, 'clientX' | 'clientY'>

export type SortableDrag = {
  sortable: Sortable
  item: HTMLElement
  startPoint: PointerPosition | undefined
}

const geometry = {
  horizontal: {
    pointer: 'clientX',
    start: 'left',
    scroll: 'scrollLeft',
    offset: 'offsetLeft',
    border: 'clientLeft',
    size: 'offsetWidth'
  },
  vertical: {
    pointer: 'clientY',
    start: 'top',
    scroll: 'scrollTop',
    offset: 'offsetTop',
    border: 'clientTop',
    size: 'offsetHeight'
  }
} as const

export const useSortableOutside = (
  activeDrag: Readonly<Ref<SortableDrag | undefined>>,
  direction: Sortable.Direction
) => {
  const axis = geometry[direction]
  const draggingList = computed(() => activeDrag.value?.sortable.el)
  const scrollContainer = computed(() => {
    const scroll = activeDrag.value?.sortable.option('scroll')
    return scroll instanceof HTMLElement ? scroll : draggingList.value
  })
  let pointer: PointerPosition | undefined

  const reorderOutsideList = () => {
    if (!activeDrag.value || !pointer) return

    const { sortable, item } = activeDrag.value
    const { el: list } = sortable
    const { clientX, clientY } = pointer
    const bounds = list.getBoundingClientRect()
    const viewport = scrollContainer.value?.getBoundingClientRect() ?? bounds

    const insideX =
      clientX >= Math.max(bounds.left, viewport.left) &&
      clientX < Math.min(bounds.right, viewport.right)
    const insideY =
      clientY >= Math.max(bounds.top, viewport.top) &&
      clientY < Math.min(bounds.bottom, viewport.bottom)
    if (insideX && insideY) return

    const items = [...list.querySelectorAll<HTMLElement>(':scope > [data-id]')]

    const currentIndex = items.indexOf(item)
    if (currentIndex < 0) return

    const position =
      pointer[axis.pointer] - bounds[axis.start] + list[axis.scroll]

    const nextIndex = items.filter(other => {
      if (other === item) return false

      // アニメーション中もレイアウト上の位置を使って挿入先を判定する
      const origin =
        other.offsetParent === list ? -list[axis.border] : list[axis.offset]
      const center = other[axis.offset] - origin + other[axis.size] / 2
      return center <= position
    }).length

    if (nextIndex === currentIndex) return

    const ids = sortable.toArray()
    const [id] = ids.splice(currentIndex, 1)
    if (id === undefined) return

    ids.splice(nextIndex, 0, id)
    sortable.sort(ids, true)
  }

  watch(
    activeDrag,
    drag => {
      pointer = drag?.startPoint
      reorderOutsideList()
    },
    { flush: 'sync' }
  )

  const updatePointer = (event: MouseEvent | TouchEvent) => {
    pointer = 'touches' in event ? event.touches[0] : event
    reorderOutsideList()
  }

  useEventListener(
    () => draggingList.value?.ownerDocument,
    ['pointermove', 'mousemove', 'touchmove'],
    updatePointer,
    { passive: true }
  )
  useEventListener(scrollContainer, 'scroll', reorderOutsideList)
}
