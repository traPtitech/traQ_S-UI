import { throttle } from 'throttle-debounce'
import { ShallowRef, ref, watch } from 'vue'

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
