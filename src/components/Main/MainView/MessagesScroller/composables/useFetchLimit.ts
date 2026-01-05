import type { ShallowRef } from 'vue'
import { computed, watch } from 'vue'

import useBoxSize from '/@/composables/dom/useBoxSize'
import { unrefElement } from '/@/lib/dom/unrefElement'

import type { MessageScrollerInstance } from '../MessagesScroller.vue'

const MIN_COUTN = 40
const MAX_COUNT = 100

const useFetchLimit = (
  scrollerRef: ShallowRef<MessageScrollerInstance | undefined>,
  messageHeight: number
) => {
  const { height } = useBoxSize(
    computed(() => unrefElement(scrollerRef) ?? null),
    false
  )

  const fetchLimit = computed(() =>
    Math.max(
      Math.min(Math.ceil((height.value ?? 0) / messageHeight), MAX_COUNT),
      MIN_COUTN
    )
  )

  const waitHeightResolved = new Promise<void>(resolve => {
    const stop = watch(
      height,
      newHeight => {
        if (newHeight !== undefined) {
          stop()
          resolve()
        }
      },
      { immediate: true }
    )
  })

  return { fetchLimit, waitHeightResolved }
}

export default useFetchLimit
