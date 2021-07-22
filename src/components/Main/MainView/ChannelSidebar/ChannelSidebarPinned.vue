<template>
  <sidebar-content-container-link
    title="ピン留め"
    :count="pinnedMessageLength"
    @click-link="onClick"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarContentContainerLink from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerLink.vue'

export default defineComponent({
  name: 'ChannelSidebarPinned',
  components: { SidebarContentContainerLink },
  props: { pinnedMessageLength: { type: Number, default: 0 } },
  setup(_, context) {
    const onClick = () => context.emit('open')
    return { onClick }
  }
})
</script>
