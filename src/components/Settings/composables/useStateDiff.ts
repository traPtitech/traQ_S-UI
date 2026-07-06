import { type MaybeRefOrGetter, toValue } from 'vue'

import { dequal } from 'dequal'

const useStateDiff = <T>() => {
  const getDiffKeys = (
    state: Readonly<Partial<T>>,
    storeStateRef: MaybeRefOrGetter<T>
  ) => {
    const storeState = toValue(storeStateRef)
    return (Object.keys(state) as Array<keyof T>).filter(key => {
      const k = key as keyof T
      return !dequal(state[k], storeState[k])
    })
  }

  const hasDiff = (
    state: Readonly<Partial<T>>,
    storeStateRef: MaybeRefOrGetter<T>
  ): boolean => {
    return getDiffKeys(state, storeStateRef).length > 0
  }

  return { getDiffKeys, hasDiff }
}

export default useStateDiff
