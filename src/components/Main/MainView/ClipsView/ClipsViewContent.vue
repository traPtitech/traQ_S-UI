<template>
  <div :class="$style.container">
    <messages-scroller
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
import { defineComponent, PropType } from '@vue/composition-api'
import { ClipFolderId } from '@/types/entity-ids'
import MessagesScroller from '@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import useClipsFetcher from './use/clipsFetcher'

export default defineComponent({
  name: 'ClipsViewContent',
  props: {
    clipFolderId: { type: String as PropType<ClipFolderId>, required: true }
  },
  components: {
    MessagesScroller
  },
  setup(props) {
    const {
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      onLoadFormerMessagesRequest
    } = useClipsFetcher(props)

    return {
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
</style>
