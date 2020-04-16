<template>
  <div :class="$style.container">
    <messages-scroller
      :message-ids="state.channelMessageIds"
      :entry-message-id="state.entryMessageId"
      :is-loading="loadMessagesState.isLoading"
      :last-loading-direction="loadMessagesState.lastLoadingDirection"
      :is-initial-load="loadMessagesState.isInitialLoad"
      @request-load-former="loadFormerMessages"
      @request-load-latter="loadLatterMessages"
    />
    <message-input :channel-id="channelId" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  computed
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MessagesScroller from './MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'
import ChannelSideBar from '@/components/Main/MainView/ChannelSideBar/ChannelSideBar.vue'
import MessagesViewFileUploadOverlay from './MessagesViewFileUploadOverlay.vue'
import { LoadingDirection } from '@/store/domain/messagesView/state'

const useLoadMessages = () => {
  const state = reactive({
    isLoading: false,
    lastLoadingDirection: computed(
      () => store.state.domain.messagesView.lastLoadingDirection
    ),
    isInitialLoad: computed(() => store.state.domain.messagesView.isInitialLoad)
  })
  const loadMessages = (direction: 'former' | 'latter') => async () => {
    state.isLoading = true
    store.commit.domain.messagesView.setLastLoadingDirection(direction)
    if (direction === 'former') {
      await store.dispatch.domain.messagesView.fetchAndRenderChannelFormerMessages()
    } else {
      await store.dispatch.domain.messagesView.fetchAndRenderChannelLatterMessages()
    }
    if (store.state.domain.messagesView.isInitialLoad) {
      store.commit.domain.messagesView.setIsInitialLoad(false)
    }
    state.isLoading = false
  }
  const loadFormerMessages = loadMessages('former')
  const loadLatterMessages = loadMessages('latter')
  return { loadMessagesState: state, loadFormerMessages, loadLatterMessages }
}

export default defineComponent({
  name: 'MessagesView',
  props: { channelId: { type: String as PropType<ChannelId>, required: true } },
  components: {
    MessagesScroller,
    MessageInput,
    MessagesViewFileUploadOverlay,
    ChannelSideBar
  },
  setup() {
    const state = reactive({
      channelMessageIds: computed(
        () => store.state.domain.messagesView.messageIds
      ),
      entryMessageId: computed(
        () => store.state.domain.messagesView.entryMessageId
      )
    })

    const containerStyle = makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))

    const {
      loadMessagesState,
      loadFormerMessages,
      loadLatterMessages
    } = useLoadMessages()

    return {
      state,
      containerStyle,
      loadMessagesState,
      loadFormerMessages,
      loadLatterMessages
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;

.container {
  display: flex;
  flex: 1 1;
  flex-direction: column;
  position: relative;
  height: 100%;
  padding: 0 $messagePadding;
}
</style>
