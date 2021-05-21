<template>
  <main-view-sidebar-page show-back-button @back="$emit('moveBack')">
    <template #header>
      <sidebar-header text="イベント" />
    </template>
    <template #content>
      <sidebar-event
        v-for="event in events"
        :key="event.datetime"
        :class="$style.item"
        :event="event"
      />
    </template>
  </main-view-sidebar-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MainViewSidebarPage from '@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarHeader from './SidebarHeader.vue'
import { ChannelId } from '@/types/entity-ids'
import useChannelEvents from './use/channelEvents'
import SidebarEvent from './SidebarEvent/SidebarEvent.vue'

export default defineComponent({
  name: 'SidebarPinnedPage',
  components: {
    MainViewSidebarPage,
    SidebarHeader,
    SidebarEvent
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

<style lang="scss" module>
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
