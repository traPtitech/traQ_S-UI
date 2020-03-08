<template>
  <div :class="$style.container" :style="containerStyle">
    <pre>Channel Id: {{ props.channelId }}</pre>
    <div v-for="message in channelMessages" :key="message.messageId">
      {{ message.content }}
    </div>
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

type Props = {
  channelId: ChannelId
}

export default defineComponent({
  name: 'MessagesView',
  props: { channelId: String },
  setup(props: Props, _: SetupContext) {
    const state = reactive({
      messages: computed(() => store.state.entities.messages),
      channels: computed(() => store.state.entities.channels)
    })

    const channelMessages = computed(() =>
      Object.values(state.messages)
        .filter(m => m.parentChannelId === props.channelId)
        .sort(m => m.createdAt?.valueOf() ?? 0)
    )

    const containerStyle = computed(() => ({
      background: store.state.app.theme.background.primary,
      color: store.state.app.theme.ui.primary
    }))

    return {
      props,
      state,
      channelMessages,
      containerStyle
    }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
  overflow: scroll;
}

.header {
  font: {
    size: 30px;
    weight: bold;
  }
}
</style>
