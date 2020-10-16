import { Ref, reactive, watchEffect } from 'vue'
import { klona } from 'klona'
import useStateDiff from './stateDiff'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

// eslint-disable-next-line @typescript-eslint/ban-types
const useSyncedState = <T extends object>(
  storeState: Ref<T>,
  setFunc: (payload: [keyof T, T[keyof T]]) => void
) => {
  const { getDiffKeys } = useStateDiff<T>()

  const state = reactive(klona(storeState.value)) as Writeable<T>

  watchEffect(() => {
    const diffKeys = getDiffKeys(state, storeState)
    diffKeys.forEach(key => {
      setFunc([key, klona(state[key])])
    })
  })

  return { state }
}

export default useSyncedState
