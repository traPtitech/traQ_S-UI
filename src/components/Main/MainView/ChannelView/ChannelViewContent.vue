<template>
  <div :class="$style.container">
    <scroll-loading-bar :class="$style.loadingBar" :show="isLoading" />
    <messages-scroller
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :entry-message-id="entryMessageId"
      :is-loading="isLoading"
      :last-loading-direction="lastLoadingDirection"
      @request-load-former="onLoadFormerMessagesRequest"
      @request-load-latter="onLoadLatterMessagesRequest"
    />
    <message-input :channel-id="channelId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import MessagesScroller from '@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'
import useChannelMessageFetcher from './use/channelMessageFetcher'
import ScrollLoadingBar from '../ScrollLoadingBar.vue'

export default defineComponent({
  name: 'ChannelViewContent',
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true },
    entryMessageId: String
  },
  components: {
    ScrollLoadingBar,
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
      onLoadFormerMessagesRequest,
      onLoadLatterMessagesRequest,
      onLoadAroundMessagesRequest
    } = useChannelMessageFetcher(props)

    return {
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      onLoadFormerMessagesRequest,
      onLoadLatterMessagesRequest,
      onLoadAroundMessagesRequest
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
</style>
