import { ref } from '@vue/composition-api'

const useToggle = (initialValue: boolean) => {
  const enabled = ref(initialValue)
  const onInput = (value: boolean) => {
    enabled.value = value
  }
  return {
    enabled,
    onInput
  }
}

export default useToggle
