<template>
  <sidebar-content-container-link title="イベント" @click-link="onClickLink" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarContentContainerLink from '/@/components/Main/MainView/MainViewSidebar/SidebarContentContainerLink.vue'

export default defineComponent({
  name: 'ChannelSidebarEvents',
  components: { SidebarContentContainerLink },
  emits: {
    clickLink: () => true
  },
  setup(props, { emit }) {
    const onClickLink = () => {
      emit('clickLink')
    }
    return { onClickLink }
  }
})
</script>
