import { computed, SetupContext } from 'vue'

const useTextModelSyncer = (
  props: { modelValue: string },
  context:
    | SetupContext<{ 'update:modelValue': (val: string) => boolean }>
    | SetupContext<Record<string, unknown>>,
  onUpdate?: (val: string) => void
) => {
  const value = computed(() => props.modelValue)
  const onInput = (e: InputEvent) => {
    const text = (e.target as HTMLInputElement | HTMLTextAreaElement).value
    onUpdate?.(text)
    context.emit('update:modelValue', text)
  }

  return { value, onInput }
}

export default useTextModelSyncer
