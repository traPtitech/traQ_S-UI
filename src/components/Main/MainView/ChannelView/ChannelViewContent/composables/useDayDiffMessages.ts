import type { Ref } from 'vue'
import { computed } from 'vue'
import { useMessagesStore } from '/@/store/entities/messages'
import type { MessageId } from '/@/types/entity-ids'

const useDayDiffMessages = (messageIds: Ref<MessageId[]>) => {
  const { messagesMap } = useMessagesStore()

  const dayDiffMessages = computed(() => {
    const result = new Set<MessageId>()
    const mIds = messageIds.value
    const mCount = mIds.length
    if (mCount < 1) return result

    result.add(mIds[0]!)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let preDate = new Date(messagesMap.value.get(mIds[0]!)?.createdAt ?? '')
    for (let i = 1; i < mCount; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const mId = mIds[i]!
      const currentDate = new Date(messagesMap.value.get(mId)?.createdAt ?? '')
      if (preDate.toDateString() !== currentDate.toDateString()) {
        result.add(mId)
      }
      preDate = currentDate
    }
    return result
  })

  return dayDiffMessages
}

export default useDayDiffMessages
