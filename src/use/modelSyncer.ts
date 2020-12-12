import { computed, SetupContext } from 'vue'

const useModelSyncer = <T>(
  props: { modelValue: T },
  context:
    | SetupContext<{ 'update:modelValue': (val: T) => boolean }>
    | SetupContext<Record<string, unknown>>,
  onUpdate?: (val: T) => void
) => {
  const value = computed({
    get: () => props.modelValue,
    set: v => {
      onUpdate?.(v)
      context.emit('update:modelValue', v)
    }
  })
  return value
}

export default useModelSyncer
