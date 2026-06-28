import type { ShallowRef } from 'vue'
import { ref, watch } from 'vue'

import { throttle } from 'throttle-debounce'

const useScrollPosition = (targetRef: ShallowRef<HTMLElement | null>) => {
  const scrollTop = ref(0)

  watch(targetRef, r => {
    if (r) {
      scrollTop.value = r.scrollTop
    }
  })

  const onScroll = throttle(16, () => {
    if (targetRef.value) {
      scrollTop.value = targetRef.value.scrollTop
    }
  })

  return { scrollTop, onScroll }
}

export default useScrollPosition
