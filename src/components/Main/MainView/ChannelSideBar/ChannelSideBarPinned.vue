<template>
  <channel-sidebar-content title="ピン留め" @click="onClick">
    <template #header-control>{{ propst.pinnedMessageLength }}</template>
  </channel-sidebar-content>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import ChannelSidebarContent from './ChannelSidebarContent.vue'

export default defineComponent({
  name: 'ChannelSidebarPinned',
  props: { pinnedMessageLength: { type: Number, default: 0 } },
  components: { ChannelSidebarContent },
  setup(props, context) {
    const onClick = () => context.emit('open')
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { pinnedMessageLength: number }
    return {
      propst,
      onClick
    }
  }
})
</script>
