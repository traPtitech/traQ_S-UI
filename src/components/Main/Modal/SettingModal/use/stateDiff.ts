import { Ref } from '@vue/composition-api'

const useStateDiff = <T>() => {
  const hasDiff = (
    state: Readonly<Partial<T>>,
    storeState: Readonly<Ref<T>>
  ): boolean => {
    return Object.keys(state).some(key => {
      const k = key as keyof T
      return (
        storeState.value[k] === undefined || state[k] !== storeState.value[k]
      )
    })
  }

  return { hasDiff }
}

export default useStateDiff
