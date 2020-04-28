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
    <message-input
      :channel-id="dmChannelId"
      :post-message-delegate="postMessageDelegate"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { UserId } from '@/types/entity-ids'
import store from '@/store'
import apis from '@/lib/apis'
import MessagesScroller from '@/components/Main/MainView/MessagesScroller/MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'
import useDMFetcher from './use/dmFetcher'

const usePostMessageToDM = (props: { userId: UserId }) => async (
  content: string
) => {
  return apis.postDirectMessage(props.userId, { content })
}

export default defineComponent({
  name: 'DMViewContent',
  props: {
    userId: { type: String as PropType<UserId>, required: true }
  },
  components: {
    MessagesScroller,
    MessageInput
  },
  setup(props) {
    const dmChannelId = computed(
      () => store.state.entities.dmChannels[props.userId]?.id ?? ''
    )
    const {
      messageIds,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      renderMessageFromIds,
      onLoadFormerMessagesRequest
    } = useDMFetcher(props)

    const postMessageDelegate = usePostMessageToDM(props)

    return {
      messageIds,
      dmChannelId,
      isReachedEnd,
      isReachedLatest,
      isLoading,
      lastLoadingDirection,
      onLoadFormerMessagesRequest,
      postMessageDelegate
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
