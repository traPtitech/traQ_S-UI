import { computed, ref, type ShallowRef } from 'vue'
import useChannelMessageFetcher from './useChannelMessageFetcher'
import { useChannelsStore } from '/@/store/entities/channels'
import { useSubscriptionStore } from '/@/store/domain/subscription'
export const useChannelView = ({
  channelId,
  entryMessageId,
  scrollerEle
}: {
  channelId: string
  entryMessageId?: string
  scrollerEle: ShallowRef<{ $el: HTMLDivElement } | undefined>
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
  } = useChannelMessageFetcher(scrollerEle, { channelId, entryMessageId })

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
    if (!scrollerEle.value) return
    showToNewMessageButton.value = false
    scrollerEle.value.$el.scrollTo({
      top: scrollerEle.value.$el.scrollHeight,
      behavior: behavior
    })
  }

  const handleScroll = () => {
    if (scrollerEle.value === undefined || isLoading.value) return
    const { scrollTop, scrollHeight, clientHeight } = scrollerEle.value.$el
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
