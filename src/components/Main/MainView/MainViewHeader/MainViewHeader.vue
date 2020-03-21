<template>
  <header :class="$style.container" :style="containerStyle">
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
import { makeStyles } from '@/lib/styles'

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
    const containerStyle = makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.primary,
      borderBottom: `2px solid ${theme.ui.tertiary}`
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
