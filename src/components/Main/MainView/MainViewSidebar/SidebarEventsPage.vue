<template>
  <main-view-sidebar-page show-back-button @back="moveBack">
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
          v-for="parsedEvent in parsedEvents"
          :key="parsedEvent.datetime"
          :class="$style.item"
          :event="parsedEvent"
        />
        <div v-if="parsedEvents.length <= 0" :class="$style.noEvents">
          イベントはありません
        </div>
      </div>
    </template>
  </main-view-sidebar-page>
</template>

<script lang="ts" setup>
import MainViewSidebarPage from '/@/components/Main/MainView/MainViewSidebar/MainViewSidebarPage.vue';
import SidebarHeader from './SidebarHeader.vue';
import SidebarEvent from './SidebarEvent/SidebarEvent.vue';
import { computed, shallowRef } from 'vue';
import { ChannelId } from '/@/types/entity-ids'
import useChannelEvents from './composables/useChannelEvents'
import { parseChannelEvent } from '/@/lib/apis'

const props = defineProps<{
    channelId: ChannelId
}>();

const emit = defineEmits<{
    (e: "moveBack"): void
}>();

const containerEle = shallowRef<HTMLElement>()
const { events, onScroll } = useChannelEvents(props, containerEle)
const parsedEvents = computed(() => events.value.map(parseChannelEvent))

const moveBack = () => {
  emit('moveBack')
}
</script>

<style lang="scss" module>
$padding: 32px;
.container {
  height: calc(100% + #{$padding});
  overflow-y: auto;
  scrollbar-gutter: stable;
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
