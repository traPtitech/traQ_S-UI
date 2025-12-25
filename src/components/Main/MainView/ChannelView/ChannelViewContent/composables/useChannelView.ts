import { type ShallowRef, computed, ref } from 'vue'

import { unrefElement } from '/@/lib/dom/unrefElement'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'

import type { MessageScrollerInstance } from '../../../MessagesScroller/MessagesScroller.vue'
import useChannelMessageFetcher from './useChannelMessageFetcher'

export const useChannelView = ({
  channelId,
  entryMessageId,
  scrollerRef
}: {
  channelId: string
  entryMessageId?: string
  scrollerRef: ShallowRef<MessageScrollerInstance | undefined>
}) => {
  const isMessageShow = ref(false)

  const {
    messageIds,
    isReachedEnd,
    isReachedLatest,
    isLoading,
    lastLoadingDirection,
    onLoadFormerMessagesRequest,
    onLoadLatterMessagesRequest
  } = useChannelMessageFetcher(scrollerRef, { channelId, entryMessageId })

  const { channelsMap } = useChannelsStore()
  const isArchived = computed(
    () => channelsMap.value.get(channelId)?.archived ?? false
  )

  const { unreadChannelsMap } = useSubscriptionStore()
  const resetIsReachedLatest = () => {
    if (!unreadChannelsMap.value.get(channelId)) return
    isReachedLatest.value = false
  }

  const showToNewMessageButton = ref(false)
  const toNewMessage = (behavior?: ScrollBehavior) => {
    if (!scrollerRef.value) return
    showToNewMessageButton.value = false
    const element = unrefElement(scrollerRef)
    if (!element) return
    element.scrollTo({
      top: element.scrollHeight,
      behavior: behavior
    })
  }

  const handleScroll = () => {
    const element = unrefElement(scrollerRef)
    if (!element || isLoading.value) return
    const { scrollTop, scrollHeight, clientHeight } = element
    showToNewMessageButton.value = scrollHeight - 2 * clientHeight > scrollTop
    if (!isReachedLatest.value) {
      showToNewMessageButton.value = true
    }
  }

  return {
    isMessageShow,
    messageIds,
    isReachedEnd,
    isReachedLatest,
    isLoading,
    lastLoadingDirection,
    onLoadFormerMessagesRequest,
    onLoadLatterMessagesRequest,
    isArchived,
    resetIsReachedLatest,
    showToNewMessageButton,
    toNewMessage,
    handleScroll
  }
}
