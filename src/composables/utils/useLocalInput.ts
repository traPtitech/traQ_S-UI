import type { Ref } from 'vue'
import { ref, watch } from 'vue'

/**
 * localValueの値がリモートの値(remoteValue)に同期される
 * 編集後にdoUpdateを実行する
 * syncEvenEditingがtrueのときは編集中でも同期する
 */
const useLocalInput = <T>(
  remoteValue: Ref<T>,
  doUpdate: (v: T) => Promise<boolean> | boolean,
  syncEvenEditing = false
) => {
  const localValue = ref(remoteValue.value) as Ref<T>
  const isEditing = ref(false)

  watch(remoteValue, newRemoteValue => {
    if (!isEditing.value || syncEvenEditing) {
      localValue.value = newRemoteValue
    }
  })

  watch(isEditing, async newIsEditing => {
    if (!newIsEditing) {
      const success = await doUpdate(localValue.value)
      if (!success) {
        isEditing.value = true
      }
    }
  })

  const sync = () => {
    localValue.value = remoteValue.value
  }

  return { localValue, isEditing, sync }
}

export default useLocalInput
