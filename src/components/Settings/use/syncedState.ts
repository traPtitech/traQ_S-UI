import { Ref, reactive, watchEffect } from 'vue'
import { klona } from 'klona'
import useStateDiff from './stateDiff'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

const useSyncedState = <T extends object>(
  storeState: Ref<T>,
  setFunc: (payload: Partial<T>) => void
) => {
  const { getDiffKeys } = useStateDiff<T>()

  const state = reactive(klona(storeState.value)) as Writeable<T>

  watchEffect(() => {
    const diffKeys = getDiffKeys(state, storeState)
    const data: Partial<T> = {}
    diffKeys.forEach(key => {
      data[key] = state[key]
    })
    setFunc(klona(data))
  })

  return { state }
}

export default useSyncedState
