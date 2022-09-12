import type { WritableComputedRef } from 'vue'
import { computed } from 'vue'

export const useModelSyncer = <
  P,
  K extends keyof P & string,
  E extends (n: `update:${K}`, val: P[K]) => void
>(
  props: P,
  emit: E,
  key: K,
  onUpdate?: (val: P[K]) => void
): WritableComputedRef<P[K]> => {
  const value = computed({
    get: () => props[key],
    set: v => {
      onUpdate?.(v)
      emit(`update:${key}` as const, v)
    }
  })
  return value
}

export const useModelValueSyncer = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends { modelValue: any },
  E extends (n: `update:modelValue`, val: P['modelValue']) => void
>(
  props: P,
  emit: E,
  onUpdate?: (val: P['modelValue']) => void
) => {
  return useModelSyncer(props, emit, 'modelValue', onUpdate)
}

type ToSyncedRefs<T> = { [KK in keyof T]: WritableComputedRef<T[KK]> }

export const useModelObjectSyncer = <
  P,
  K extends keyof P & string,
  E extends (n: `update:${K}`, val: P[K]) => void
>(
  props: P extends { [k in K]: object } ? P : never,
  emit: E,
  key = 'modelValue' as K
): ToSyncedRefs<P[K]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const computedObject: ToSyncedRefs<P[K]> = {} as any

  for (const k of Object.keys(props[key]) as Array<keyof P[K]>) {
    computedObject[k] = computed({
      get() {
        return props[key][k]
      },
      set(v) {
        emit(`update:${key}` as const, { ...props[key], [k]: v })
      }
    })
  }
  return computedObject
}
