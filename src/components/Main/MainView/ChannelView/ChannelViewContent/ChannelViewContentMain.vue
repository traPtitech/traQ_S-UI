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
      :unread-since="unreadSince"
      @request-load-former="onLoadFormerMessagesRequest"
      @request-load-latter="onLoadLatterMessagesRequest"
    >
      <template #default="{ messageId, onChangeHeight, onEntryMessageLoaded }">
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
import { ChannelId } from '/@/types/entity-ids'
import useChannelMessageFetcher from './composables/useChannelMessageFetcher'
import { useChannelsStore } from '/@/store/entities/channels'
import MessageElement from '/@/components/Main/MainView/MessageElement/MessageElement.vue'

const props = defineProps<{
  channelId: ChannelId
  entryMessageId?: string
}>()

const { channelsMap } = useChannelsStore()

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

.element {
  margin: 4px 0;
  contain: content;
}
</style>
