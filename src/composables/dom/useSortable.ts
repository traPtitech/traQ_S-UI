import {
  type MaybeRefOrGetter,
  type Ref,
  computed,
  shallowRef,
  toValue,
  watch
} from 'vue'

import Sortable from 'sortablejs'

import { type SortableDrag, useSortableOutside } from './useSortableOutside'

type DragStartEvent = Sortable.SortableEvent & {
  originalEvent?: MouseEvent | TouchEvent
}

type Options = Omit<
  Sortable.Options,
  'draggable' | 'group' | 'onEnd' | 'onStart' | 'onUpdate' | 'scroll' | 'store'
> & {
  /** リストの外でも指定した軸に沿って並べ替える */
  sortOutside?: Sortable.Direction
  scroll?: MaybeRefOrGetter<Sortable.Options['scroll'] | null>
}

export const useSortable = (
  container: Readonly<Ref<HTMLElement | null>>,
  onReorder: (ids: string[]) => void,
  { sortOutside, scroll, ...options }: Options = {}
) => {
  const activeDrag = shallowRef<SortableDrag>()
  const isDragging = computed(() => activeDrag.value !== undefined)

  if (sortOutside) useSortableOutside(activeDrag, sortOutside)

  const endDrag = () => {
    activeDrag.value = undefined
  }

  watch(
    [container, () => toValue(scroll)],
    ([element, scrollOption], _, onCleanup) => {
      if (!element) return

      const scrollTarget = scrollOption ?? (sortOutside ? element : undefined)
      let nextItem: Element | null = null
      const sortable = Sortable.create(element, {
        animation: 150,
        draggable: '>[data-id]',
        ...options,
        ...(scrollTarget !== undefined && { scroll: scrollTarget }),
        ...(sortOutside && {
          direction: sortOutside,
          forceFallback: true,
          fallbackOnBody: true,
          bubbleScroll: options.bubbleScroll ?? false
        }),
        onStart: ({ item, originalEvent }: DragStartEvent) => {
          nextItem = item.nextElementSibling
          activeDrag.value = {
            sortable,
            item,
            startPoint:
              originalEvent && 'touches' in originalEvent
                ? originalEvent.touches[0]
                : originalEvent
          }
        },
        onEnd: endDrag,
        onUpdate: ({ item }) => {
          const ids = sortable.toArray()

          // Vue が並べ替え前の DOM を基準に差分を適用できるようにする
          element.insertBefore(
            item,
            nextItem?.parentElement === element ? nextItem : null
          )
          onReorder(ids)
        }
      })

      onCleanup(() => {
        endDrag()
        sortable.destroy()
      })
    },
    { immediate: true, flush: 'post' }
  )

  return { isDragging }
}
