import { Ref, reactive, watchEffect } from '@vue/composition-api'
import { klona } from 'klona'
import useStateDiff from './stateDiff'

// eslint-disable-next-line @typescript-eslint/ban-types
const useSyncedState = <T extends object>(
  storeState: Ref<T>,
  setFunc: (payload: [keyof T, T[keyof T]]) => void
) => {
  const { getDiffKeys } = useStateDiff<T>()

  const state = reactive(klona(storeState.value)) as T

  watchEffect(() => {
    const diffKeys = getDiffKeys(state, storeState)
    diffKeys.forEach(key => {
      setFunc([key, klona(state[key])])
    })
  })

  return { state }
}

export default useSyncedState
