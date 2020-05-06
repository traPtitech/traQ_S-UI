<template>
  <div :class="$style.container">
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
import { makeStyles } from '@/lib/styles'

import MessagesScroller from '@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'
import ChannelViewFileUploadOverlay from './ChannelViewFileUploadOverlay.vue'
import useChannelMessageFetcher from './use/channelMessageFetcher'

export default defineComponent({
  name: 'ChannelViewContent',
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true },
    entryMessageId: String
  },
  components: {
    MessagesScroller,
    MessageInput,
    ChannelViewFileUploadOverlay
  },
  setup(props) {
    const containerStyle = makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))

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
      containerStyle,
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
</style>
