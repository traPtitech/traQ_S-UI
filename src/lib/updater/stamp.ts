import apis from '/@/lib/apis'
import { useStampHistory } from '/@/store/domain/stampHistory'
import { useStampRecommendations } from '/@/store/domain/stampRecommendations'
import { useMessagesStore } from '/@/store/entities/messages'
import { useToastStore } from '/@/store/ui/toast'
import type { MessageId, StampId } from '/@/types/entity-ids'

export const useStampUpdater = () => {
  const { addErrorToast } = useToastStore()
  const { upsertLocalStampHistory } = useStampHistory()
  const { recordStampUsage } = useStampRecommendations()
  const { addStampLocally, removeStampLocally } = useMessagesStore()

  const addStampOptimistically = async (
    messageId: MessageId,
    stampId: StampId
  ) => {
    const operation = addStampLocally(messageId, stampId)
    upsertLocalStampHistory(stampId, new Date())
    recordStampUsage(stampId)
    try {
      await apis.addMessageStamp(messageId, stampId)
      await operation?.commit()
    } catch {
      addErrorToast('メッセージにスタンプを追加できませんでした')
      await operation?.rollback()
    }
  }

  const removeStampOptimistically = async (
    messageId: MessageId,
    stampId: StampId
  ) => {
    const operation = removeStampLocally(messageId, stampId)
    try {
      await apis.removeMessageStamp(messageId, stampId)
      await operation?.commit()
    } catch {
      addErrorToast('メッセージからスタンプを削除できませんでした')
      await operation?.rollback()
    }
  }

  return { addStampOptimistically, removeStampOptimistically }
}
