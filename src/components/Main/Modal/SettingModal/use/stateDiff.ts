import { Ref } from 'vue'
import { dequal } from 'dequal'

const useStateDiff = <T>() => {
  const getDiffKeys = (
    state: Readonly<Partial<T>>,
    storeState: Readonly<Ref<T>>
  ) => {
    return (Object.keys(state) as Array<keyof T>).filter(key => {
      const k = key as keyof T
      return !dequal(state[k], storeState.value[k])
    })
  }

  const hasDiff = (
    state: Readonly<Partial<T>>,
    storeState: Readonly<Ref<T>>
  ): boolean => {
    return getDiffKeys(state, storeState).length > 0
  }

  return { getDiffKeys, hasDiff }
}

export default useStateDiff
