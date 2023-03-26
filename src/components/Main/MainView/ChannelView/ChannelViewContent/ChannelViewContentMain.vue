<template>
  <div :class="$style.container">
    <scroll-loading-bar :class="$style.loadingBar" :show="isLoading" />
    <messages-scroller
      ref="scrollerEle"
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :is-loading="isLoading"
      :entry-message-id="entryMessageId"
      :last-loading-direction="lastLoadingDirection"
      @request-load-former="onLoadFormerMessagesRequest"
      @request-load-latter="onLoadLatterMessagesRequest"
      @scroll.passive="handleScroll"
    >
      <template #default="{ messageId, onChangeHeight, onEntryMessageLoaded }">
        <messages-scroller-separator
          v-if="messageId === firstUnreadMessageId"
          title="ここから未読"
          :class="$style.unreadSeparator"
        />
        <messages-scroller-separator
          v-if="dayDiffMessages.has(messageId)"
          :title="createdDate(messageId)"
          :class="$style.dateSeparator"
        />
        <message-element
          :class="$style.element"
          :message-id="messageId"
          :is-archived="isArchived"
          :is-entry-message="messageId === entryMessageId"
          :pinned-user-id="messagePinnedUserMap.get(messageId)"
          @change-height="onChangeHeight"
          @entry-message-loaded="onEntryMessageLoaded"
        />
      </template>
    </messages-scroller>
    <message-input
      :channel-id="channelId"
      :typing-users="typingUsers"
      :show-to-new-message-button="showToNewMessageButton"
      @click-to-new-message-button="toNewMessage"
    />
  </div>
</template>

<script lang="ts" setup>
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '/@/components/Main/MainView/MessageInput/MessageInput.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import { computed, ref, shallowRef } from 'vue'
import type { ChannelId, MessageId, UserId } from '/@/types/entity-ids'
import useChannelMessageFetcher from './composables/useChannelMessageFetcher'
import { useChannelsStore } from '/@/store/entities/channels'
import MessageElement from '/@/components/Main/MainView/MessageElement/MessageElement.vue'
import MessagesScrollerSeparator from '/@/components/Main/MainView/MessagesScroller/MessagesScrollerSeparator.vue'
import { useMessagesStore } from '/@/store/entities/messages'
import useDayDiffMessages from './composables/useDayDiffMessages'
import { getFullDayString } from '/@/lib/basic/date'
import type { Pin } from '@traptitech/traq'
import { useRouter } from 'vue-router'

const props = defineProps<{
  channelId: ChannelId
  entryMessageId?: string
  pinnedMessages: Pin[]
  typingUsers: UserId[]
}>()

const router = useRouter()

const scrollerEle = shallowRef<{ $el: HTMLDivElement } | undefined>()
const {
  messageIds,
  isReachedEnd,
  isReachedLatest,
  isLoading,
  lastLoadingDirection,
  unreadSince,
  onLoadFormerMessagesRequest,
  onLoadLatterMessagesRequest,
  onLoadAroundMessagesRequest
} = useChannelMessageFetcher(scrollerEle, props)

const { messagesMap } = useMessagesStore()
const firstUnreadMessageId = computed(() => {
  if (!unreadSince.value) return ''
  return (
    messageIds.value.find(
      id => messagesMap.value.get(id)?.createdAt === unreadSince.value
    ) ?? ''
  )
})

const dayDiffMessages = useDayDiffMessages(messageIds)
const createdDate = (id: MessageId) => {
  const message = messagesMap.value.get(id)
  if (!message) {
    return ''
  }

  return getFullDayString(new Date(message.createdAt))
}

const { channelsMap } = useChannelsStore()
const isArchived = computed(
  () => channelsMap.value.get(props.channelId)?.archived ?? false
)
const messagePinnedUserMap = computed(
  () => new Map(props.pinnedMessages.map(pin => [pin.message.id, pin.userId]))
)

const showToNewMessageButton = ref(false)
const toNewMessage = () => {
  router.push('/channels/gps/times/mehm8128')
}

const handleScroll = () => {
  if (scrollerEle.value === undefined) return
  const { scrollTop, scrollHeight, clientHeight } = scrollerEle.value.$el
  showToNewMessageButton.value = scrollHeight - 2 * clientHeight > scrollTop
  if (!isReachedLatest.value) {
    showToNewMessageButton.value = true
  }
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex: 1 1;
  flex-direction: column;
  position: relative;
  height: 100%;
  width: 100%;
}

.loadingBar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 12px;
  z-index: $z-index-message-loading;
}

.unreadSeparator {
  color: $theme-accent-notification-default;
}

.dateSeparator {
  @include color-ui-secondary;
}
.element {
  margin: 4px 0;
  contain: content;
}
</style>
