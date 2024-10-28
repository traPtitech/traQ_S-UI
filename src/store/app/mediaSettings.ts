import { toRefs } from 'vue'

import { acceptHMRUpdate, defineStore } from 'pinia'

import useIndexedDbValue from '/@/composables/storage/useIndexedDbValue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

export type IDBState = {
  audioVolume: Readonly<number> | undefined
}

const useMediaSettingsStorePinia = defineStore('app/mediaSettings', () => {
  const initialValue: IDBState = {
    audioVolume: 1
  }

  const [state, restoring, restoringPromise] = useIndexedDbValue(
    'store/app/mediaSettings',
    1,
    {},
    initialValue
  )

  return {
    ...toRefs(state),
    restoring,
    restoringPromise
  }
})

export const useMediaSettingsStore = convertToRefsStore(
  useMediaSettingsStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useMediaSettingsStorePinia, import.meta.hot)
  )
}
