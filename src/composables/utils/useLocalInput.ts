import { Ref, ref, watch } from 'vue'

/**
 * 編集中以外はリモートの値(remoteValue)に同期する
 * 編集後にdoUpdateを実行する
 */
const useLocalInput = <T>(
  remoteValue: Ref<T>,
  doUpdate: (v: T) => Promise<boolean> | boolean
) => {
  const localValue = ref(remoteValue.value) as Ref<T>
  const isEditing = ref(false)

  watch(remoteValue, newRemoteValue => {
    if (isEditing.value) return
    localValue.value = newRemoteValue
  })

  watch(isEditing, async newIsEditing => {
    if (!newIsEditing) {
      const success = await doUpdate(localValue.value)
      if (success) {
        isEditing.value = false
      }
    }
  })

  return { localValue, isEditing }
}

export default useLocalInput
