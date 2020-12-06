import { computed } from 'vue'

const useMaxLength = (state: {
  val: string
  maxLength: number | undefined
}) => {
  const length = computed(() => Array.from(state.val).length)
  const isExceeded = computed(
    () => !!(state.maxLength && state.maxLength < length.value)
  )

  return { length, isExceeded }
}

export default useMaxLength
