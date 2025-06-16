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
    >
      <template #default="{ messageId, onChangeHeight, onEntryMessageLoaded }">
        <clip-element
          :class="$style.element"
          :message-id="messageId"
          @change-height="onChangeHeight"
          @entry-message-loaded="onEntryMessageLoaded"
        />
      </template>
    </messages-scroller>
  </div>
</template>

<script lang="ts" setup>
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import ScrollLoadingBar from '/@/components/Main/MainView/ScrollLoadingBar.vue'
import { shallowRef } from 'vue'
import type { ClipFolderId } from '/@/types/entity-ids'
import useClipsFetcher from './composables/useClipsFetcher'
import ClipElement from '/@/components/Main/MainView/MessageElement/ClipElement.vue'

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
