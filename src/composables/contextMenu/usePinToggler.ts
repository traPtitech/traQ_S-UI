import type { Ref } from 'vue'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import apis from '/@/lib/apis'
import type { MessageId } from '/@/types/entity-ids'

const usePinToggler = (messageId: Ref<MessageId>) => {
  const { execWithToast } = useExecWithToast()

  const addPinned = async () => {
    await execWithToast(undefined, 'ピン留めに失敗しました', async () => {
      await apis.createPin(messageId.value)
    })
  }

  const removePinned = async () => {
    await execWithToast(undefined, 'ピン留めの解除に失敗しました', async () => {
      await apis.removePin(messageId.value)
    })
  }

  return { addPinned, removePinned }
}

export default usePinToggler
