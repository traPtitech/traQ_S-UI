<template>
  <div :class="$style.container" :style="containerStyle">
    <messages-scroller :messageIds="state.channelMessageIds" />
    <message-input :channel-id="state.channelId" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  computed
} from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import MessagesScroller from './MessagesScroller.vue'
import MessageInput from '@/components/Main/MainView/MessageInput/MessageInput.vue'

type Props = {
  channelId: ChannelId
}

export default defineComponent({
  name: 'MessagesView',
  props: { channelId: String },
  components: { MessagesScroller, MessageInput },
  setup(props: Props, _: SetupContext) {
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

    return {
      props,
      state,
      containerStyle
    }
  }
})
</script>

<style lang="scss" module>
$messagePadding: 32px;

.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 $messagePadding;
}

.header {
  font: {
    size: 30px;
    weight: bold;
  }
}
</style>
