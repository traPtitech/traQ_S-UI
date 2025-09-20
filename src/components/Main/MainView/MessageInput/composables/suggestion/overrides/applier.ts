import {
  computed,
  toValue,
  unref,
  type ComputedRef,
  type MaybeRefOrGetter,
  type UnwrapRef
} from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Invocable = (...args: any[]) => any

type Condition = MaybeRefOrGetter<boolean>
type Overrides = Record<string, MaybeRefOrGetter<unknown>>

type Applied<T, Overrides> = {
  [K in keyof T]: T[K] extends Invocable
    ? T[K]
    : K extends keyof Overrides
      ? ComputedRef<UnwrapRef<T[K]> | UnwrapRef<Overrides[K]>>
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
    if (value instanceof Function) return { ...applied, [key]: value }

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
    overrides: <
      C extends MaybeRefOrGetter<boolean>,
      O extends Record<string, MaybeRefOrGetter<unknown>>
    >(
      override: (value: T) => {
        condition: C
        overrides: O
      }
    ) => toOverridable(apply(values, override(values)))
  }
}
