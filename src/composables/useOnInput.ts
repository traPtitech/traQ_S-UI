import { type Ref } from 'vue'

const useOnInput = (modelValue: Ref<string | number>) => (e: Event) => {
  modelValue.value = (e.target as HTMLInputElement | HTMLTextAreaElement).value
}

export default useOnInput
