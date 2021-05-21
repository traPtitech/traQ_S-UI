<template>
  <main-view-sidebar-page show-back-button @back="$emit('moveBack')">
    <template #header>
      <sidebar-header text="イベント" />
    </template>
    <template #content>
      {{ events }}
    </template>
  </main-view-sidebar-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarHeader from './SidebarHeader.vue'
import { ChannelId } from '@/types/entity-ids'
import useChannelEvents from './use/channelEvents'

export default defineComponent({
  name: 'SidebarPinnedPage',
  components: {
    MainViewSidebarPage,
    SidebarHeader
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props) {
    const { events } = useChannelEvents(props)
    return { events }
  }
})
</script>
