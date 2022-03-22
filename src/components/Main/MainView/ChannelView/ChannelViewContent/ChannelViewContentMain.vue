<template>
  <div :class="$style.container">
    <scroll-loading-bar :class="$style.loadingBar" :show="isLoading" />
    <messages-scroller
      ref="scrollerEle"
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :is-loading="isLoading"
      :last-loading-direction="lastLoadingDirection"
      @request-load-former="onLoadFormerMessagesRequest"
      @request-load-latter="onLoadLatterMessagesRequest"
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
          @change-height="onChangeHeight"
          @entry-message-loaded="onEntryMessageLoaded"
        />
      </template>
    </messages-scroller>
    <message-input :channel-id="channelId" />
  </div>
</template>

<script lang="ts" setup>
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '/@/components/Main/MainView/MessageInput/MessageInput.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import { computed, shallowRef } from 'vue'
import { ChannelId, MessageId } from '/@/types/entity-ids'
import useChannelMessageFetcher from './composables/useChannelMessageFetcher'
import { useChannelsStore } from '/@/store/entities/channels'
import MessageElement from '/@/components/Main/MainView/MessageElement/MessageElement.vue'
import MessagesScrollerSeparator from '/@/components/Main/MainView/MessagesScroller/MessagesScrollerSeparator.vue'
import { useMessagesStore } from '/@/store/entities/messages'
import useDayDiffMessages from './composables/useDayDiffMessages'
import { getFullDayString } from '/@/lib/basic/date'

const props = defineProps<{
  channelId: ChannelId
  entryMessageId?: string
}>()

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
