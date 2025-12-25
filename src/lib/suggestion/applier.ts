import {
  type ComputedRef,
  type MaybeRefOrGetter,
  type UnwrapRef,
  computed,
  toValue,
  unref
} from 'vue'

import type { Invocable } from '/@/types/utility'

type Condition = MaybeRefOrGetter<boolean>
type Overrides = Record<string, MaybeRefOrGetter<unknown>>

type Applied<T, O> = {
  [K in keyof T]: T[K] extends Invocable
    ? K extends keyof O
      ? O[K] extends Invocable
        ? (...args: Parameters<T[K]>) => ReturnType<T[K]> | ReturnType<O[K]>
        : never
      : T[K]
    : K extends keyof O
      ? ComputedRef<UnwrapRef<T[K]> | UnwrapRef<O[K]>>
      : ComputedRef<UnwrapRef<T[K]>>
}

const apply = <
  T extends Record<string, MaybeRefOrGetter | Invocable>,
  C extends Condition,
  O extends Overrides
>(
  values: T,
  {
    condition,
    overrides
  }: {
    condition: C
    overrides: O
  }
) => {
  return Object.entries(values).reduce((applied, [key, value]) => {
    if (value instanceof Function)
      return {
        ...applied,
        [key]: (...input: Parameters<typeof value>) => {
          if (overrides[key] instanceof Function && toValue(condition)) {
            return overrides[key](...input)
          } else {
            return value(...input)
          }
        }
      }

    return {
      ...applied,
      [key]: computed(() => {
        if (overrides[key] && toValue(condition)) {
          return unref(overrides[key])
        }
        return unref(value)
      })
    }
  }, {}) as Applied<T, O>
}

export const toOverridable = <
  T extends Record<string, MaybeRefOrGetter | Invocable>
>(
  values: T
) => {
  return {
    ...values,
    overrides: <C extends Condition, O extends Overrides>(
      override: (value: T) => {
        condition: C
        overrides: O
      }
    ) => toOverridable(apply(values, override(values)))
  }
}
