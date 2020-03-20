<template>
  <div :class="$style.container" :style="containerStyle">
    <messages-scroller :messageIds="state.channelMessageIds" />
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

type Props = {
  channelId: ChannelId
}

export default defineComponent({
  name: 'MessagesView',
  props: { channelId: String },
  components: { MessagesScroller },
  setup(props: Props, _: SetupContext) {
    const state = reactive({
      channelMessageIds: computed(
        () => store.state.domain.messagesView.messageIds
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
.container {
  height: 100%;
}

.header {
  font: {
    size: 30px;
    weight: bold;
  }
}
</style>
