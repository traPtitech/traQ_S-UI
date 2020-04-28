<template>
  <div :class="$style.container">
    <messages-scroller
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :is-loading="isLoading"
      :last-loading-direction="lastLoadingDirection"
      @request-load-former="onLoadFormerMessagesRequest"
    />
    <message-input :channel-id="''" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import MessagesScroller from '@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'
import useDMFetcher from './use/dmFetcher'

export default defineComponent({
  name: 'ClipsViewContent',
  props: {
    userId: { type: String as PropType<UserId>, required: true }
  },
  components: {
    MessagesScroller,
    MessageInput
  },
  setup(props) {
    const {
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      renderMessageFromIds,
      onLoadFormerMessagesRequest
    } = useDMFetcher(props)

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
