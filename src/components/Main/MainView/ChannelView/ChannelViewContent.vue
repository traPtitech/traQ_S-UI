<template>
  <div :class="$style.container">
    <scroll-loading-bar :class="$style.loadingBar" :show="isLoading" />
    <messages-scroller
      ref="scrollerEle"
      :message-ids="messageIds"
      :is-reached-end="isReachedEnd"
      :is-reached-latest="isReachedLatest"
      :entry-message-id="entryMessageId"
      :is-archived="isArchived"
      :is-loading="isLoading"
      :last-loading-direction="lastLoadingDirection"
      @request-load-former="onLoadFormerMessagesRequest"
      @request-load-latter="onLoadLatterMessagesRequest"
    />
    <message-input :channel-id="channelId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, shallowRef } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import MessagesScroller from '/@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '/@/components/Main/MainView/MessageInput/MessageInput.vue'
import useChannelMessageFetcher from './use/channelMessageFetcher'
import ScrollLoadingBar from '../ScrollLoadingBar.vue'
import store from '/@/store'

export default defineComponent({
  name: 'ChannelViewContent',
  components: {
    ScrollLoadingBar,
    MessagesScroller,
    MessageInput
  },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true },
    entryMessageId: { type: String, default: undefined }
  },
  setup(props) {
    const scrollerEle = shallowRef<{ $el: HTMLDivElement } | undefined>()
    const {
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      onLoadFormerMessagesRequest,
      onLoadLatterMessagesRequest,
      onLoadAroundMessagesRequest
    } = useChannelMessageFetcher(scrollerEle, props)

    const isArchived = computed(
      () =>
        store.state.entities.channelsMap.get(props.channelId)?.archived ?? false
    )

    return {
      scrollerEle,
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      onLoadFormerMessagesRequest,
      onLoadLatterMessagesRequest,
      onLoadAroundMessagesRequest,
      isArchived
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
