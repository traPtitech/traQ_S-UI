import { ref, watch, Ref } from 'vue'
import { throttle } from 'throttle-debounce'

const useThrottled = <T>(r: Ref<T>) => {
  const v = ref(r.value) as Ref<T>

  const update = throttle(100, () => {
    v.value = r.value
  })

  watch(r, () => {
    update()
  })

  return v
}

export default useThrottled
