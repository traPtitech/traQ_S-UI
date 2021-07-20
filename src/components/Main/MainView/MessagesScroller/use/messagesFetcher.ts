import { computed, ref, Ref } from 'vue'
import store from '/@/store'
import { MessageId } from '/@/types/entity-ids'
import { Message } from '@traptitech/traq'

export type LoadingDirection = 'former' | 'latter' | 'around' | 'latest'

const useMessageFetcher = (
  props: { entryMessageId?: MessageId },
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
    | undefined
) => {
  // メッセージIDはwsイベントで処理されるため、storeに置く
  const messageIds = computed(() => store.state.domain.messagesView.messageIds)
  const isReachedEnd = ref(false)
  const isReachedLatest = ref(false)
  const isLoading = ref(false)
  const isInitialLoad = ref(false)
  const lastLoadingDirection = ref('latest' as LoadingDirection)

  /**
   * 表示チャンネル/クリップフォルダによって一意に定まるもの
   *
   * 非同期処理を行う際は表示しようとしてるものが変化しているかチェックする必要があるため、
   * そのチェックの際に前後で変化していないかという形で利用する
   */
  const getCurrentViewIdentifier = () => {
    const channelId = store.state.domain.messagesView.currentChannelId
    if (channelId) {
      return `ch:${channelId}`
    }
    const clipFolderId = store.state.domain.messagesView.currentClipFolderId
    if (clipFolderId) {
      return `cf:${clipFolderId}`
    }
    return ''
  }

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
    const id = getCurrentViewIdentifier()
    const result = await fetch()
    if (id !== getCurrentViewIdentifier()) return
    await apply(result)
  }

  const renderMessageFromIds = async (messageIdsToRender: MessageId[]) => {
    await Promise.all(
      messageIdsToRender.map(messageId =>
        store.dispatch.domain.messagesView.renderMessageContent(messageId)
      )
    )
  }

  const reset = () => {
    store.commit.domain.messagesView.setMessageIds([])
    isReachedEnd.value = false
    isReachedLatest.value = false
    store.dispatch.domain.messagesView.setShouldRetriveMessageCreateEvent(false)
    store.commit.domain.messagesView.setMessageIds([])
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

        store.commit.domain.messagesView.setMessageIds([
          ...new Set([...newMessageIds.reverse(), ...messageIds.value])
        ])
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

        store.commit.domain.messagesView.setMessageIds([
          ...new Set([...messageIds.value, ...newMessageIds])
        ])
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
    const entryMessage = await store.dispatch.entities.messages.fetchMessage({
      messageId
    })
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

        store.commit.domain.messagesView.setMessageIds(newMessageIds)
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

        store.commit.domain.messagesView.setMessageIds([
          ...new Set([...messageIds.value, ...newMessageIds])
        ])
      }
    )
  }

  const init = () => {
    reset()
    if (props.entryMessageId) {
      onLoadAroundMessagesRequest(props.entryMessageId)
    } else {
      isReachedLatest.value = true
      store.dispatch.domain.messagesView.setShouldRetriveMessageCreateEvent(
        true
      )
      onLoadFormerMessagesRequest()
    }
  }

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
    loadNewMessages
  }
}

export default useMessageFetcher
