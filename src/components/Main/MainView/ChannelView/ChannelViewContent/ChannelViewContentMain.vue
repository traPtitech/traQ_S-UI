<template>
  <div :class="$style.container">
    <ScrollLoadingBar :class="$style.loadingBar" :show="isLoading" />
    <MessagesScroller
      :id="channelId"
      ref="scrollerRef"
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :is-loading="isLoading"
      :entry-message-id="entryMessageId"
      :last-loading-direction="lastLoadingDirection"
      @request-load-former="onLoadFormerMessagesRequest"
      @request-load-latter="onLoadLatterMessagesRequest"
      @scroll="handleScroll"
      @reset-is-reached-latest="resetIsReachedLatest"
    >
      <template #default="{ messageId }">
        <MessagesScrollerSeparator
          v-if="messageId === firstUnreadMessageId"
          title="ここから未読"
          :class="$style.unreadSeparator"
        />
        <MessagesScrollerSeparator
          v-if="dayDiffMessages.has(messageId)"
          :title="createdDate(messageId)"
          :class="$style.dateSeparator"
        />
        <MessageElement
          :class="$style.element"
          :message-id="messageId"
          :is-archived="isArchived"
          :is-entry-message="messageId === entryMessageId"
          :pinned-user-id="messagePinnedUserMap.get(messageId)"
        />
      </template>
    </MessagesScroller>
    <MessageInput
      :channel-id="channelId"
      :typing-users="typingUsers"
      :show-to-new-message-button="showToNewMessageButton"
      @click-to-new-message-button="toNewMessage"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Pin } from '@traptitech/traq'

import { computed, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import MessageElement from '/@/components/Main/MainView/MessageElement/MessageElement.vue'
import MessageInput from '/@/components/Main/MainView/MessageInput/MessageInput.vue'
import MessagesScroller, {
  type MessageScrollerInstance
} from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessagesScrollerSeparator from '/@/components/Main/MainView/MessagesScroller/MessagesScrollerSeparator.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import useChannelPath from '/@/composables/useChannelPath'
import { getFullDayString } from '/@/lib/basic/date'
import { unrefElement } from '/@/lib/dom/unrefElement'
import { constructChannelPath, constructUserPath } from '/@/router'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'
import { useMessagesStore } from '/@/store/entities/messages'
import type { ChannelId, MessageId, UserId } from '/@/types/entity-ids'

import useChannelMessageFetcher from './composables/useChannelMessageFetcher'
import useDayDiffMessages from './composables/useDayDiffMessages'

const props = defineProps<{
  channelId: ChannelId
  entryMessageId?: string
  pinnedMessages: Pin[]
  typingUsers: UserId[]
}>()

const router = useRouter()

const scrollerRef = shallowRef<MessageScrollerInstance>()
const {
  messageIds,
  isReachedEnd,
  isReachedLatest,
  isLoading,
  lastLoadingDirection,
  unreadSince,
  onLoadFormerMessagesRequest,
  onLoadLatterMessagesRequest
} = useChannelMessageFetcher(scrollerRef, props)

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

const { channelsMap, dmChannelsMap } = useChannelsStore()
const isArchived = computed(
  () => channelsMap.value.get(props.channelId)?.archived ?? false
)
const messagePinnedUserMap = computed(
  () => new Map(props.pinnedMessages.map(pin => [pin.message.id, pin.userId]))
)

const { unreadChannelsMap } = useSubscriptionStore()
const resetIsReachedLatest = () => {
  if (!unreadChannelsMap.value.get(props.channelId)) return
  isReachedLatest.value = false
}

const showToNewMessageButton = ref(false)
const { channelIdToPathString } = useChannelPath()
const toNewMessage = async () => {
  if (props.entryMessageId) {
    const channelPath = channelIdToPathString(props.channelId) as string
    if (dmChannelsMap.value.has(props.channelId)) {
      await router.replace(constructUserPath(channelPath))
    } else {
      await router.replace(constructChannelPath(channelPath))
    }
  }

  scrollerRef.value?.scrollToBottom()
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
