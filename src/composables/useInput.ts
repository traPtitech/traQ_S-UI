import type { Ref } from 'vue'

type InputElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement

const useInput = (modelValue: Ref<string | number>) => {
  const onInput = (event: Event) =>
    (modelValue.value = (event.target as InputElement).value)
  return {
    onInput
  }
}

export default useInput
