<template>
  <div ref="containerRef" :class="$style.container">
    <messages-scroller :message-ids="state.channelMessageIds" />
    <message-input :channel-id="state.channelId" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  computed,
  ref,
  Ref
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MessagesScroller from './MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'
import ChannelSideBar from '@/components/Main/MainView/ChannelSideBar/ChannelSideBar.vue'
import MessagesViewFileUploadOverlay from './MessagesViewFileUploadOverlay.vue'
import { debounce } from 'lodash-es'

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
      channelId: computed(
        () => store.state.domain.messagesView.currentChannelId
      )
    })

    const containerStyle = makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary
    }))

    const containerRef = ref<HTMLElement>(null)
    return {
      state,
      containerStyle,
      containerRef
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
