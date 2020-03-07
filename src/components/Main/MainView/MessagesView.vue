<template>
  <div :class="$style.Block">
    <Header>
      {{
        props.channelId in state.channels
          ? '#' + state.channels[props.channelId].name
          : 'メッセージビュー'
      }}
    </Header>
    <button @click="setSingleLayout">
      single layout
    </button>
    <button @click="setSplitLayout">
      split layout
    </button>
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
    const setSingleLayout = () => store.commit.ui.mainView.setLayout('single')
    const setSplitLayout = () => store.commit.ui.mainView.setLayout('split')

    const state = reactive({
      messages: computed(() => store.state.entities.messages),
      channels: computed(() => store.state.entities.channels)
    })

    const channelMessages = computed(() =>
      Object.values(state.messages)
        .filter(m => m.parentChannelId === props.channelId)
        .sort(m => m.createdAt?.valueOf() ?? 0)
    )

    return {
      props,
      state,
      setSingleLayout,
      setSplitLayout,
      channelMessages
    }
  }
})
</script>

<style lang="scss" module>
.Block {
  color: blue;
}

.Header {
  font: {
    size: 30px;
    weight: bold;
  }
}
</style>
