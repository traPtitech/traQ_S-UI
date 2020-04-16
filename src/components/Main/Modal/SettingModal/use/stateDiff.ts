import { Ref } from '@vue/composition-api'
import { isEqual } from 'lodash-es'

const useStateDiff = <T>() => {
  const getDiffKeys = (
    state: Readonly<Partial<T>>,
    storeState: Readonly<Ref<T>>
  ) => {
    return (Object.keys(state) as Array<keyof T>).filter(key => {
      const k = key as keyof T
      return !isEqual(state[k], storeState.value[k])
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
