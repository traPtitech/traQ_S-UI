import type { Ref } from 'vue'
import { ref, watchEffect } from 'vue'
import type { MessageId } from '/@/types/entity-ids'
import type { Message } from '@traptitech/traq'
import { useMessagesView } from '/@/store/domain/messagesView'
import { useMessagesStore } from '/@/store/entities/messages'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'

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
    | ((isReachedLatest: Ref<boolean>) => Promise<MessageId[]>)
    | undefined,
  fetchAroundMessages:
    | ((
        entryMessage: Message,
        isReachedLatest: Ref<boolean>,
        isReachedEnd: Ref<boolean>
      ) => Promise<MessageId[]>)
    | undefined,
  fetchNewMessages:
    | ((isReachedLatest: Ref<boolean>) => Promise<MessageId[]>)
    | undefined,
  onReachedLatest?: () => void | Promise<void>
) => {
  const { renderMessageContent, resetRenderedContent } = useMessagesView()
  const { shouldReceiveLatestMessages } = useViewStateSenderStore()
  const { fetchMessage } = useMessagesStore()

  const messageIds = ref<MessageId[]>([])
  const isReachedEnd = ref(false)
  const isReachedLatest = ref(false)
  const isLoading = ref(false)
  const isInitialLoad = ref(false)
  const lastLoadingDirection = ref<LoadingDirection>('latest')

  /**
   * 表示チャンネル/クリップフォルダが変化していないかチェックをして適用する
   *
   * @param fetch 取得する関数。データを返す
   * @param apply 適用する関数。表示チャンネル/クリップフォルダが変化していないときに実行される。fetchで返したデータを引数で受け取れる
   */
  const runWithIdentifierCheck = async <T>(
    fetch: () => Promise<T>,
    apply: (result: T) => void | Promise<void>
  ) => {
    const beforeId = id.value
    const result = await fetch()
    if (id.value !== beforeId) return
    await apply(result)
  }

  const renderMessageFromIds = async (messageIdsToRender: MessageId[]) => {
    await Promise.all(
      messageIdsToRender.map(messageId => renderMessageContent(messageId))
    )
  }

  const reset = () => {
    messageIds.value = []
    isReachedEnd.value = false
    isReachedLatest.value = false
    isLoading.value = false
    isInitialLoad.value = false
    lastLoadingDirection.value = 'latest'
  }

  const onLoadFormerMessagesRequest = async () => {
    if (isReachedEnd.value) {
      return
    }
    isLoading.value = true

    await runWithIdentifierCheck(
      async () => {
        const newMessageIds = await fetchFormerMessages(isReachedEnd)
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        isLoading.value = false
        isInitialLoad.value = false
        lastLoadingDirection.value = 'former'
        messageIds.value = [
          ...new Set([...newMessageIds.reverse(), ...messageIds.value])
        ]
      }
    )
  }

  const onLoadLatterMessagesRequest = async () => {
    if (!fetchLatterMessages || isReachedLatest.value) {
      return
    }
    isLoading.value = true

    await runWithIdentifierCheck(
      async () => {
        const newMessageIds = await fetchLatterMessages(isReachedLatest)
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        isLoading.value = false
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
    const entryMessage = await fetchMessage({ messageId })
    if (!entryMessage) {
      return
    }
    isLoading.value = true

    await runWithIdentifierCheck(
      async () => {
        const newMessageIds = await fetchAroundMessages(
          entryMessage,
          isReachedLatest,
          isReachedEnd
        )
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        isLoading.value = false
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
    if (!fetchNewMessages || !isReachedLatest.value) {
      return
    }
    isReachedLatest.value = false
    isLoading.value = true

    await runWithIdentifierCheck(
      async () => {
        const newMessageIds = await fetchNewMessages(isReachedLatest)
        await renderMessageFromIds(newMessageIds)
        return newMessageIds
      },
      newMessageIds => {
        isLoading.value = false
        lastLoadingDirection.value = 'latter'
        messageIds.value = [...new Set([...messageIds.value, ...newMessageIds])]
      }
    )
  }

  const addNewMessage = async (messageId: MessageId) => {
    await renderMessageContent(messageId)

    // すでに追加済みの場合は追加しない
    // https://github.com/traPtitech/traQ_S-UI/issues/1748
    if (messageIds.value.includes(messageId)) return
    messageIds.value.push(messageId)
  }

  const init = () => {
    resetRenderedContent()
    if (props.entryMessageId) {
      onLoadAroundMessagesRequest(props.entryMessageId)
    } else {
      isReachedLatest.value = true
      onLoadFormerMessagesRequest()
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
    renderMessageFromIds,
    onLoadFormerMessagesRequest,
    onLoadLatterMessagesRequest,
    onLoadAroundMessagesRequest,
    loadNewMessages,
    addNewMessage
  }
}

export default useMessageFetcher
