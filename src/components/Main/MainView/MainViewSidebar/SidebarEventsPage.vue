<template>
  <main-view-sidebar-page show-back-button @back="$emit('moveBack')">
    <template #header>
      <sidebar-header text="イベント" />
    </template>
    <template #content>
      <div
        ref="containerEle"
        :class="$style.container"
        @scroll.passive="onScroll"
      >
        <sidebar-event
          v-for="event in events"
          :key="event.datetime"
          :class="$style.item"
          :event="event"
        />
        <div v-if="events.length <= 0" :class="$style.noEvents">
          イベントはありません
        </div>
      </div>
    </template>
  </main-view-sidebar-page>
</template>

<script lang="ts">
import { defineComponent, PropType, shallowRef } from 'vue'
import MainViewSidebarPage from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue'
import SidebarHeader from './SidebarHeader.vue'
import { ChannelId } from '/@/types/entity-ids'
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
    const containerEle = shallowRef<HTMLElement>()
    const { events, onScroll } = useChannelEvents(props, containerEle)
    return { containerEle, events, onScroll }
  }
})
</script>

<style lang="scss" module>
$padding: 32px;
.container {
  height: calc(100% + #{$padding});
  overflow-y: auto;
  margin: -$padding;
  margin-top: 0;
  padding: $padding;
  padding-top: 0;
}

.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.noEvents {
  @include color-ui-tertiary;
}
</style>
