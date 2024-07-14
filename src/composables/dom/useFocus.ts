import { ref } from 'vue'

const useFocus = () => {
  const isFocused = ref(false)

  const onFocus = () => {
    isFocused.value = true
  }
  const onBlur = () => {
    isFocused.value = false
  }

  return { isFocused, onFocus, onBlur }
}

export default useFocus
