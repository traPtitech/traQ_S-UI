import { type Ref } from 'vue'

const useOnInput = (modelValue: Ref<string>) => (e: Event) => {
  const text = (e.target as HTMLInputElement | HTMLTextAreaElement).value
  modelValue.value = text
}

export default useOnInput
