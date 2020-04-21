import { ref } from '@vue/composition-api'

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
