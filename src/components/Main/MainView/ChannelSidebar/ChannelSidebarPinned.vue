<template>
  <sidebar-content-container-link
    title="ピン留め"
    @click="onClick"
    :count="pinnedMessageLength"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import SidebarContentContainerLink from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerLink.vue'

export default defineComponent({
  name: 'ChannelSidebarPinned',
  props: { pinnedMessageLength: { type: Number, default: 0 } },
  components: { SidebarContentContainerLink },
  setup(_, context) {
    const onClick = () => context.emit('open')
    return { onClick }
  }
})
</script>
