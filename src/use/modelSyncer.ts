import { computed, ComputedRef, SetupContext } from 'vue'

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

export const useModelObjectSyncer = <P, K extends keyof P>(
  props: P,
  key = 'modelValue' as K,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (name: string, ...args: any[]) => void
): { [KK in keyof P[K]]: ComputedRef<P[K][KK]> } => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computedObject: any = {}
  for (const k of Object.keys(props[key])) {
    computedObject[k] = computed({
      get() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (props[key] as any)[k]
      },
      set(v) {
        emit(`update:${key}`, { ...props[key], [k]: v })
      }
    })
  }
  return computedObject
}
