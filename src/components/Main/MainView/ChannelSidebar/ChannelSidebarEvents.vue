<template>
  <sidebar-content-container-link title="イベント" @click-link="onClick" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarContentContainerLink from '@/components/Main/MainView/MainViewSidebar/SidebarContentContainerLink.vue'

export default defineComponent({
  name: 'ChannelSidebarEvents',
  components: { SidebarContentContainerLink },
  setup(_, context) {
    const onClick = () => context.emit('open')
    return { onClick }
  }
})
</script>
