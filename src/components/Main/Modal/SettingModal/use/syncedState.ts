import { Ref, reactive, watchEffect } from '@vue/composition-api'
import { cloneDeep } from 'lodash-es'
import useStateDiff from './stateDiff'

const useSyncedState = <T extends object>(
  storeState: Ref<T>,
  setFunc: (payload: [keyof T, T[keyof T]]) => void
) => {
  const { getDiffKeys } = useStateDiff<T>()

  const state = reactive(cloneDeep(storeState.value)) as T

  watchEffect(() => {
    const diffKeys = getDiffKeys(state, storeState)
    diffKeys.forEach(key => {
      setFunc([key, cloneDeep(state[key])])
    })
  })

  return { state }
}

export default useSyncedState
