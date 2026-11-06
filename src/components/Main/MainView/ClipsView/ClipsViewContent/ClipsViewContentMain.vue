<template>
  <div :class="$style.container">
    <ScrollLoadingBar :class="$style.loadingBar" :show="isLoading" />
    <MessagesScroller
      ref="scrollerRef"
      :message-ids="messageIds"
      :has-reached-oldest="hasReachedOldest"
      :is-caught-up="isCaughtUp"
      :is-loading="isLoading"
      :last-load-kind="lastLoadKind"
      @request-load-older="onLoadOlderMessagesRequest"
    >
      <template #default="{ messageId, onChangeHeight, onEntryMessageLoaded }">
        <ClipElement
          :class="$style.element"
          :message-id="messageId"
          @change-height="onChangeHeight"
          @entry-message-loaded="onEntryMessageLoaded"
        />
      </template>
    </MessagesScroller>
  </div>
</template>

<script lang="ts" setup>
import { shallowRef } from 'vue'

import MessagesScroller, {
  type MessageScrollerInstance
} from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import type { ClipFolderId } from '/@/types/entity-ids'

import ClipElement from '../../MessageElement/ClipElement.vue'
import useClipsFetcher from './composables/useClipsFetcher'

const props = defineProps<{
  clipFolderId: ClipFolderId
}>()

const scrollerRef = shallowRef<MessageScrollerInstance>()
const {
  messageIds,
  hasReachedOldest,
  isCaughtUp,
  isLoading,
  lastLoadKind,
  onLoadOlderMessagesRequest
} = useClipsFetcher(scrollerRef, props)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex: 1 1;
  flex-direction: column;
  position: relative;
  height: 100%;
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
