import { computed } from 'vue'

const useMaxLength = (state: {
  value: string
  maxLength: number | undefined
}) => {
  const length = computed(() => Array.from(state.value).length)
  const isExceeded = computed(
    () => !!(state.maxLength && state.maxLength < length.value)
  )

  return { length, isExceeded }
}

export default useMaxLength
