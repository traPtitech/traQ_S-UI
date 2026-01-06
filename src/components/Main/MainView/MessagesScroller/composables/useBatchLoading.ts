import { ref } from 'vue'

import { isDefined } from '/@/lib/basic/array'
import type { MessageId } from '/@/types/entity-ids'

const useBatchLoading = () => {
  // バッチ管理: 同じロードバッチのメッセージを一括で表示/非表示するための仕組み
  let nextBatchId = 0
  const messageBatchMap = ref<Map<MessageId, number>>(new Map())
  const batchReadyState = ref<Map<number, { total: number; ready: number }>>(
    new Map()
  )
  const lastCompletedBatchId = ref<number>(-1)

  /**
   * 新しいバッチを登録する
   */
  const registerBatch = (newMessageIds: MessageId[]): number => {
    if (newMessageIds.length === 0) return -1
    const batchId = nextBatchId++
    const prevBathceCount = messageBatchMap.value.size
    for (const messageId of newMessageIds) {
      if (messageBatchMap.value.has(messageId)) continue
      messageBatchMap.value.set(messageId, batchId)
    }
    batchReadyState.value.set(batchId, {
      total: messageBatchMap.value.size - prevBathceCount,
      ready: 0
    })
    return batchId
  }

  /**
   * メッセージがレンダリング完了したことを通知する
   */
  const markMessageReady = (messageId: MessageId) => {
    const batchId = messageBatchMap.value.get(messageId)
    if (!isDefined(batchId)) return

    const state = batchReadyState.value.get(batchId)
    if (!state) return

    state.ready++

    if (state.ready >= state.total) {
      lastCompletedBatchId.value = batchId
    }

    // リアクティビティをトリガーするために新しいMapを作成
    batchReadyState.value = new Map(batchReadyState.value)
  }

  /**
   * メッセージが属するバッチが全て準備完了しているかを確認する
   */
  const isBatchReady = (messageId: MessageId): boolean => {
    const batchId = messageBatchMap.value.get(messageId)
    if (batchId === undefined) return true

    const state = batchReadyState.value.get(batchId)
    if (!state) return true

    return state.ready >= state.total
  }

  const reset = () => {
    nextBatchId = 0
    messageBatchMap.value.clear()
    batchReadyState.value.clear()
    lastCompletedBatchId.value = -1
  }

  return {
    registerBatch,
    markMessageReady,
    isBatchReady,
    lastCompletedBatchId,
    reset
  }
}

export default useBatchLoading
