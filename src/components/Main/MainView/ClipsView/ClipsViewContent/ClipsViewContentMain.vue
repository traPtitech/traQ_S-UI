<template>
  <div :class="$style.container">
    <ScrollLoadingBar :class="$style.loadingBar" :show="isLoading" />
    <MessagesScroller
      ref="scrollerEle"
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :is-loading="isLoading"
      :last-loading-direction="lastLoadingDirection"
      @request-load-former="onLoadFormerMessagesRequest"
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

import ClipElement from '/@/components/Main/MainView/MessageElement/ClipElement.vue'
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import type { ClipFolderId } from '/@/types/entity-ids'

import useClipsFetcher from './composables/useClipsFetcher'

const props = defineProps<{
  clipFolderId: ClipFolderId
}>()

const scrollerEle = shallowRef<{ $el: HTMLDivElement } | undefined>()
const {
  messageIds,
  isReachedEnd,
  isReachedLatest,
  isLoading,
  lastLoadingDirection,
  onLoadFormerMessagesRequest
} = useClipsFetcher(scrollerEle, props)
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
