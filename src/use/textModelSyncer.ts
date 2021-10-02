import { computed } from 'vue'

const useTextModelSyncer = (
  props: { modelValue: string },
  emit: (v: 'update:modelValue', val: string) => void,
  onUpdate?: (val: string) => void
) => {
  const value = computed(() => props.modelValue)
  const onInput = (e: InputEvent) => {
    const text = (e.target as HTMLInputElement | HTMLTextAreaElement).value
    onUpdate?.(text)
    emit('update:modelValue', text)
  }

  return { value, onInput }
}

export default useTextModelSyncer
