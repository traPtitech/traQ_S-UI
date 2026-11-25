import type { Message } from '@traptitech/traq'

import type { Ref } from 'vue'
import { computed, onScopeDispose, ref, shallowRef, watchEffect } from 'vue'

import { useMessagesView } from '/@/store/domain/messagesView'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'
import { useMessagesStore } from '/@/store/entities/messages'
import type { MessageId } from '/@/types/entity-ids'
import type { MaybePromise } from '/@/types/utility'

export type LoadingDirection = 'former' | 'latter' | 'around' | 'latest'

const useMessageFetcher = (
  props: { entryMessageId?: MessageId },
  /**
   * 表示チャンネル/クリップフォルダによって一意に定まるもの
   *
   * 非同期処理を行う際は表示しようとしてるものが変化しているかチェックする必要があるため、
   * そのチェックの際に前後で変化していないかという形で利用する
   */
  id: Ref<string>,
  fetchFormerMessages: (isReachedEnd: Ref<boolean>) => Promise<MessageId[]>,
  fetchLatterMessages:
    ((isReachedLatest: Ref<boolean>) => Promise<MessageId[]>) | undefined,
  fetchAroundMessages:
    | ((
        entryMessage: Message,
        isReachedLatest: Ref<boolean>,
        isReachedEnd: Ref<boolean>
      ) => Promise<MessageId[]>)
    | undefined,
  fetchNewMessages:
    ((isReachedLatest: Ref<boolean>) => Promise<MessageId[]>) | undefined,
  onReachedLatest?: () => MaybePromise<void>
) => {
  const { renderMessageContent, resetRenderedContent } = useMessagesView()
  const { shouldReceiveLatestMessages } = useViewStateSenderStore()
  const { fetchMessage } = useMessagesStore()

  const messageIds = ref<MessageId[]>([])
  const isReachedEnd = ref(false)
  const isReachedLatest = ref(false)
  const loadCompletion = shallowRef<Promise<void>>()
  const isLoading = computed(() => loadCompletion.value !== undefined)
  const isInitialLoad = ref(false)
  const lastLoadingDirection = ref<LoadingDirection>('latest')

  // 同じチャンネルを開き直した場合も、以前の取得結果を無効にする。
  let viewRevision = 0
  const resetLoadState = () => {
    viewRevision++
    loadCompletion.value = undefined
  }

  /**
   * 表示範囲の読み込みを直列化し、移動前の取得結果が表示に混ざるのを防ぐ。
   */
  const runMessageLoad = <T>(
    fetch: () => Promise<T>,
    apply: (result: T) => void
  ) => {
    if (isLoading.value) return Promise.resolve(false)

    const revision = viewRevision
    const beforeId = id.value
    const request = Promise.resolve()
      .then(fetch)
      .then(result => {
        if (revision !== viewRevision || id.value !== beforeId) return false

        apply(result)

        return true
      })
      .finally(() => {
        if (revision === viewRevision) {
          loadCompletion.value = undefined
        }
      })

    loadCompletion.value = request.then(
      () => undefined,
      () => undefined
    )

    return request
  }

  const waitForMessageLoad = () => loadCompletion.value

  onScopeDispose(resetLoadState)

  const renderMessageFromIds = async (messageIdsToRender: MessageId[]) => {
    await Promise.all(
      messageIdsToRender.map(messageId => renderMessageContent(messageId))
    )
  }

  const reset = () => {
    resetLoadState()
    messageIds.value = []
    isReachedEnd.value = false
    isReachedLatest.value = false
    isInitialLoad.value = false
    lastLoadingDirection.value = 'latest'
  }

  const onLoadFormerMessagesRequest = async () => {
    if (isReachedEnd.value) {
      return
    }
    await runMessageLoad(
      async () => {
        const newMessageIds = await fetchFormerMessages(isReachedEnd)
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        isInitialLoad.value = false
        lastLoadingDirection.value = 'former'
        messageIds.value = [...new Set([...newMessageIds, ...messageIds.value])]
      }
    )
  }

  const onLoadLatestMessagesRequest = async () => {
    await runMessageLoad(
      async () => {
        const newMessageIds = await fetchFormerMessages(isReachedEnd)
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        isInitialLoad.value = false
        lastLoadingDirection.value = 'latest'
        messageIds.value = [...new Set([...newMessageIds, ...messageIds.value])]
      }
    )
  }

  const onLoadLatterMessagesRequest = async () => {
    if (!fetchLatterMessages || isReachedLatest.value) {
      return
    }
    await runMessageLoad(
      async () => {
        const newMessageIds = await fetchLatterMessages(isReachedLatest)
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        isInitialLoad.value = false
        lastLoadingDirection.value = 'latter'
        messageIds.value = [...new Set([...messageIds.value, ...newMessageIds])]
      }
    )
  }

  const onLoadAroundMessagesRequest = async (messageId: MessageId) => {
    if (
      !fetchAroundMessages ||
      isReachedLatest.value ||
      isReachedEnd.value ||
      isLoading.value
    ) {
      return
    }
    await runMessageLoad(
      async () => {
        const entryMessage = await fetchMessage({ messageId })
        if (!entryMessage) return

        const newMessageIds = await fetchAroundMessages(
          entryMessage,
          isReachedLatest,
          isReachedEnd
        )
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        if (!newMessageIds) return

        isInitialLoad.value = false
        lastLoadingDirection.value = 'around'
        messageIds.value = newMessageIds
      }
    )
  }

  /**
   * 再取得が必要な場合に最新メッセージを再取得する
   * 過去メッセージ閲覧中は何もしない
   */
  const loadNewMessages = async () => {
    if (!fetchNewMessages || !isReachedLatest.value || isLoading.value) {
      return
    }
    isReachedLatest.value = false

    await runMessageLoad(
      async () => {
        const newMessageIds = await fetchNewMessages(isReachedLatest)
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        lastLoadingDirection.value = 'latter'
        messageIds.value = [...new Set([...messageIds.value, ...newMessageIds])]
      }
    )
  }

  const addNewMessage = async (messageId: MessageId) => {
    const beforeId = id.value
    await renderMessageContent(messageId)

    // すでに追加済みの場合は追加しない
    // https://github.com/traPtitech/traQ_S-UI/issues/1748
    if (messageIds.value.includes(messageId)) return
    // チャンネルの移動などで id が変化していたら追加しない
    // https://github.com/traPtitech/traQ_S-UI/issues/4218
    if (beforeId !== id.value) return

    messageIds.value.push(messageId)
  }

  const init = () => {
    resetRenderedContent()
    if (props.entryMessageId) {
      onLoadAroundMessagesRequest(props.entryMessageId)
    } else {
      isReachedLatest.value = true
      onLoadLatestMessagesRequest()
    }
  }

  watchEffect(async () => {
    if (isReachedLatest.value) {
      await onReachedLatest?.()
    }
    shouldReceiveLatestMessages.value = isReachedLatest.value
  })

  return {
    messageIds,
    isReachedEnd,
    isReachedLatest,
    isLoading,
    isInitialLoad,
    lastLoadingDirection,
    reset,
    init,
    runMessageLoad,
    waitForMessageLoad,
    renderMessageFromIds,
    onLoadFormerMessagesRequest,
    onLoadLatterMessagesRequest,
    onLoadAroundMessagesRequest,
    loadNewMessages,
    addNewMessage
  }
}

export default useMessageFetcher
