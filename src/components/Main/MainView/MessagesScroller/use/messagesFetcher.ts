import { computed, ref, Ref } from '@vue/composition-api'
import store from '@/store'
import { ChannelId, MessageId } from '@/types/entity-ids'
import { Message } from '@traptitech/traq'

export type LoadingDirection = 'former' | 'latter' | 'around' | 'latest'

const useMessageFetcher = (
  props: { entryMessageId?: MessageId },
  fetchFormerMessages: (isReachedEnd: Ref<boolean>) => Promise<ChannelId[]>,
  fetchLatterMessages:
    | ((isReachedLatest: Ref<boolean>) => Promise<ChannelId[]>)
    | undefined,
  fetchAroundMessages:
    | ((
        entryMessage: Message,
        isReachedLatest: Ref<boolean>,
        isReachedEnd: Ref<boolean>
      ) => Promise<ChannelId[]>)
    | undefined
) => {
  // メッセージIDはwsイベントで処理されるため、storeに置く
  const messageIds = computed(() => store.state.domain.messagesView.messageIds)
  const isReachedEnd = ref(false)
  const isReachedLatest = ref(false)
  const isLoading = ref(false)
  const isInitialLoad = ref(false)
  const lastLoadingDirection = ref('latest' as LoadingDirection)

  const renderMessageFromIds = async (messageIdsToRender: ChannelId[]) => {
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
    store.commit.domain.messagesView.setShouldRetriveMessageCreateEvent(false)
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

    const newMessageIds = await fetchFormerMessages(isReachedEnd)
    await renderMessageFromIds(newMessageIds)

    isLoading.value = false
    isInitialLoad.value = false
    lastLoadingDirection.value = 'former'

    store.commit.domain.messagesView.setMessageIds([
      ...new Set([...newMessageIds.reverse(), ...messageIds.value])
    ])
  }

  const onLoadLatterMessagesRequest = async () => {
    if (!fetchLatterMessages || isReachedLatest.value) {
      return
    }
    isLoading.value = true

    const newMessageIds = await fetchLatterMessages(isReachedLatest)
    await renderMessageFromIds(newMessageIds)

    isLoading.value = false
    isInitialLoad.value = false
    lastLoadingDirection.value = 'latter'

    store.commit.domain.messagesView.setMessageIds([
      ...new Set([...messageIds.value, ...newMessageIds])
    ])
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
    const entryMessage =
      store.state.entities.messages[messageId] ??
      (await store.dispatch.entities.fetchMessage(messageId))
    if (!entryMessage) {
      return
    }
    isLoading.value = true

    const newMessageIds = await fetchAroundMessages(
      entryMessage,
      isReachedLatest,
      isReachedEnd
    )
    await renderMessageFromIds(newMessageIds)

    isLoading.value = false
    isInitialLoad.value = false
    lastLoadingDirection.value = 'around'

    store.commit.domain.messagesView.setMessageIds(newMessageIds)
  }

  const init = () => {
    reset()
    if (props.entryMessageId) {
      onLoadAroundMessagesRequest(props.entryMessageId)
    } else {
      isReachedLatest.value = true
      store.commit.domain.messagesView.setShouldRetriveMessageCreateEvent(true)
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
    onLoadAroundMessagesRequest
  }
}

export default useMessageFetcher
