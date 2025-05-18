import apis from '/@/lib/apis'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useMessagesStore } from '/@/store/entities/messages'
import { useToastStore } from '/@/store/ui/toast'
import type { MessageId, StampId } from '/@/types/entity-ids'

export const useStampUpdater = () => {
  const { addErrorToast } = useToastStore()
  const { upsertLocalStampHistory } = useStampHistory()
  const { addStampLocally, removeStampLocally } = useMessagesStore()

  const addStampOptimistically = async (
    messageId: MessageId,
    stampId: StampId
  ) => {
    const cancel = addStampLocally(messageId, stampId)
    upsertLocalStampHistory(stampId, new Date())
    try {
      await apis.addMessageStamp(messageId, stampId)
    } catch {
      addErrorToast('メッセージにスタンプを追加できませんでした')
      cancel?.()
    }
  }

  const removeStampOptimistically = async (
    messageId: MessageId,
    stampId: StampId
  ) => {
    const cancel = removeStampLocally(messageId, stampId)
    try {
      await apis.removeMessageStamp(messageId, stampId)
    } catch {
      addErrorToast('メッセージからスタンプを削除できませんでした')
      cancel?.()
    }
  }

  return { addStampOptimistically, removeStampOptimistically }
}
