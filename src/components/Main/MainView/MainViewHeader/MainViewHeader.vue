<template>
  <header
    :class="$style.container"
    :style="containerStyle"
    v-theme="
      theme => ({
        color: theme.ui.primary,
        background: theme.background.primary,
        borderBottom: `2px solid ${theme.background.secondary}`
      })
    "
  >
    <h2>
      {{
        props.channelId in state.channels
          ? '#' + state.channels[props.channelId].name
          : 'メッセージビュー'
      }}
    </h2>
  </header>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'

type Props = {
  channelId: ChannelId
}

export default defineComponent({
  name: 'MainViewHeader',
  props: { channelId: String },
  setup(props: Props) {
    const state = reactive({
      channels: computed(() => store.state.entities.channels)
    })
    const containerStyle = computed(() => ({
      background: store.state.app.theme.background.primary,
      color: store.state.app.theme.ui.primary,
      borderBottom: `2px solid ${store.state.app.theme.background.secondary}`
    }))
    return { props, state, containerStyle }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
}
</style>
