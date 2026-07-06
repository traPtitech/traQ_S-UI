import { type MaybeRef, toValue } from 'vue'

import { dequal } from 'dequal'

const useStateDiff = <T>() => {
  const getDiffKeys = (
    state: Readonly<Partial<T>>,
    storeState: Readonly<MaybeRef<T>>
  ) => {
    return (Object.keys(state) as Array<keyof T>).filter(key => {
      const k = key as keyof T
      return !dequal(state[k], toValue(storeState)[k])
    })
  }

  const hasDiff = (
    state: Readonly<Partial<T>>,
    storeState: Readonly<MaybeRef<T>>
  ): boolean => {
    return getDiffKeys(state, storeState).length > 0
  }

  return { getDiffKeys, hasDiff }
}

export default useStateDiff
