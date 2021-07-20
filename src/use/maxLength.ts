import { computed } from 'vue'
import { countLength } from '/@/lib/util/string'

const useMaxLength = (state: {
  val: string
  maxLength: number | undefined
}) => {
  const length = computed(() => countLength(state.val))
  const isExceeded = computed(
    () => !!(state.maxLength && state.maxLength < length.value)
  )

  return { length, isExceeded }
}

export default useMaxLength
