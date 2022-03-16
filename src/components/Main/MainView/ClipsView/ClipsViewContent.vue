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
      without-separator
      @request-load-former="onLoadFormerMessagesRequest"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, shallowRef } from 'vue'
import { ClipFolderId } from '/@/types/entity-ids'
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import useClipsFetcher from './composables/useClipsFetcher'
import ScrollLoadingBar from '../ScrollLoadingBar.vue'

export default defineComponent({
  name: 'ClipsViewContent',
  components: {
    MessagesScroller,
    ScrollLoadingBar
  },
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  setup(props) {
    const scrollerEle = shallowRef<{ $el: HTMLDivElement } | undefined>()
    const {
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      onLoadFormerMessagesRequest
    } = useClipsFetcher(scrollerEle, props)

    return {
      scrollerEle,
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      onLoadFormerMessagesRequest
    }
  }
})
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
</style>
