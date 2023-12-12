import type { Ref } from 'vue'
import apis from '/@/lib/apis'
import type { MessageId, ClipFolderId } from '/@/types/entity-ids'
import { useToastStore } from '/@/store/ui/toast'
import type { AxiosError } from 'axios'

export const useCreateClip = (
  messageId: MessageId,
  isSelected: Ref<Set<ClipFolderId>>
) => {
  const { addSuccessToast, addErrorToast } = useToastStore()

  const createClip = async (clipFolderId: ClipFolderId) => {
    try {
      await apis.clipMessage(clipFolderId, {
        messageId: messageId
      })
      isSelected.value.add(clipFolderId)
      addSuccessToast('クリップフォルダに追加しました')
    } catch (e) {
      if ((e as AxiosError).response?.status === 409) {
        isSelected.value.add(clipFolderId)
        addErrorToast('すでに追加されています')
        return
      } else {
        addErrorToast('追加に失敗しました')
      }
      throw e
    }
  }
  const deleteClip = async (clipFolderId: ClipFolderId) => {
    await apis.unclipMessage(clipFolderId, messageId)
    isSelected.value.delete(clipFolderId)
    addSuccessToast('クリップフォルダから削除しました')
  }
  const toggleClip = async (clipFolderId: ClipFolderId) => {
    if (isSelected.value.has(clipFolderId)) {
      await deleteClip(clipFolderId)
    } else {
      await createClip(clipFolderId)
    }
  }
  return { toggleClip }
}
