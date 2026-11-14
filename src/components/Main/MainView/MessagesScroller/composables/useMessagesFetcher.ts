import type { Message } from '@traptitech/traq'

import type { Ref } from 'vue'
import { onScopeDispose, ref, watchEffect } from 'vue'

import { useMessagesView } from '/@/store/domain/messagesView'
import { useViewStateSenderStore } from '/@/store/domain/viewStateSenderStore'
import { useMessagesStore } from '/@/store/entities/messages'
import type { MessageId } from '/@/types/entity-ids'
import type { MaybePromise } from '/@/types/utility'

export type LoadingDirection = 'former' | 'latter' | 'around' | 'latest'

interface MessagePage {
  messages: Message[]
  isReachedEnd?: boolean
  isReachedLatest?: boolean
}

interface MessagePageLoader<Page extends MessagePage> {
  fetchFormerMessages: () => Promise<Page>
  fetchLatterMessages?: () => Promise<Page>
  fetchAroundMessages?: (entryMessage: Message) => Promise<Page>
  fetchNewMessages?: () => Promise<Page>
  applyPagination: (page: Page) => void
  onReachedLatest?: (isCurrentView: () => boolean) => MaybePromise<void>
}

const useMessageFetcher = <Page extends MessagePage>(
  props: { entryMessageId?: MessageId },
  id: Ref<string>,
  {
    fetchFormerMessages,
    fetchLatterMessages,
    fetchAroundMessages,
    fetchNewMessages,
    applyPagination,
    onReachedLatest
  }: MessagePageLoader<Page>
) => {
  const { renderMessageContent, resetRenderedContent } = useMessagesView()
  const { shouldReceiveLatestMessages } = useViewStateSenderStore()
  const { fetchMessage, extendMessagesMap } = useMessagesStore()

  const messageIds = ref<MessageId[]>([])
  const isReachedEnd = ref(false)
  const isReachedLatest = ref(false)
  const isLoading = ref(false)
  const lastLoadingDirection = ref<LoadingDirection>('latest')
  let viewGeneration = 0
  let pendingLoad: Promise<void> | undefined

  const captureView = () => {
    const generation = viewGeneration
    const viewId = id.value
    const entryMessageId = props.entryMessageId

    return () =>
      viewGeneration === generation &&
      id.value === viewId &&
      props.entryMessageId === entryMessageId
  }

  const reset = () => {
    viewGeneration += 1
    pendingLoad = undefined
    messageIds.value = []
    isReachedEnd.value = false
    isReachedLatest.value = false
    isLoading.value = false
    lastLoadingDirection.value = 'latest'
  }

  onScopeDispose(() => {
    viewGeneration += 1
  })

  const loadPage = (
    direction: LoadingDirection,
    fetchPage: (isCurrentView: () => boolean) => Promise<Page | undefined>
  ) => {
    if (isLoading.value) return

    const isCurrentView = captureView()
    isLoading.value = true

    const load = async () => {
      try {
        const page = await fetchPage(isCurrentView)
        if (!page || !isCurrentView()) return

        extendMessagesMap(page.messages)
        const pageIds = [...new Set(page.messages.map(message => message.id))]
        await Promise.all(pageIds.map(renderMessageContent))
        if (!isCurrentView()) return

        applyPagination(page)

        if (page.isReachedEnd !== undefined) {
          isReachedEnd.value = page.isReachedEnd
        }

        if (page.isReachedLatest !== undefined) {
          isReachedLatest.value = page.isReachedLatest
        }

        lastLoadingDirection.value = direction

        switch (direction) {
          case 'around':
            messageIds.value = pageIds
            break
          case 'latter':
            messageIds.value = [...new Set([...messageIds.value, ...pageIds])]
            break
          case 'former':
          case 'latest':
            messageIds.value = [...new Set([...pageIds, ...messageIds.value])]
            break
        }
      } finally {
        if (isCurrentView()) {
          pendingLoad = undefined
          isLoading.value = false
        }
      }
    }

    pendingLoad = load()
    return pendingLoad
  }

  const onLoadFormerMessagesRequest = () => {
    if (isReachedEnd.value) return

    return loadPage('former', fetchFormerMessages)
  }

  const onLoadLatterMessagesRequest = () => {
    if (!fetchLatterMessages || isReachedLatest.value) return

    return loadPage('latter', fetchLatterMessages)
  }

  const loadNewMessages = async () => {
    if (!fetchNewMessages || !isReachedLatest.value) return

    const isCurrentView = captureView()
    if (pendingLoad) {
      await pendingLoad
      if (!isCurrentView() || !isReachedLatest.value || isLoading.value) return
    }

    isReachedLatest.value = false
    await loadPage('latter', fetchNewMessages)
  }

  const addNewMessage = async (messageId: MessageId) => {
    const isCurrentView = captureView()
    await renderMessageContent(messageId)
    if (!isCurrentView() || messageIds.value.includes(messageId)) return

    messageIds.value.push(messageId)
  }

  const init = () => {
    resetRenderedContent()

    const { entryMessageId } = props
    if (entryMessageId && fetchAroundMessages) {
      return loadPage('around', async isCurrentView => {
        const entryMessage = await fetchMessage({ messageId: entryMessageId })
        if (!entryMessage || !isCurrentView()) return

        return fetchAroundMessages(entryMessage)
      })
    }

    isReachedLatest.value = true
    return loadPage('latest', fetchFormerMessages)
  }

  watchEffect(() => {
    shouldReceiveLatestMessages.value = isReachedLatest.value
    if (isReachedLatest.value) return onReachedLatest?.(captureView())
  })

  return {
    messageIds,
    isReachedEnd,
    isReachedLatest,
    isLoading,
    lastLoadingDirection,
    reset,
    init,
    onLoadFormerMessagesRequest,
    onLoadLatterMessagesRequest,
    loadNewMessages,
    addNewMessage
  }
}

export default useMessageFetcher
