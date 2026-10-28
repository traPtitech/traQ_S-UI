<template>
  <div>
    <ChannelInformationSidebarViewers
      v-model="isViewersDetailOpen"
      :viewer-ids="viewerIds"
      :inactive-viewer-ids="inactiveViewerIds"
      :class="$style.item"
    />
    <ChannelInformationSidebarPinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.item"
      @click-link="emit('moveToPinned')"
    />
    <ChannelInformationSidebarEvents
      :class="$style.item"
      @click-link="emit('moveToEvents')"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import ChannelInformationSidebarEvents from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarEvents.vue'
import ChannelInformationSidebarPinned from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarPinned.vue'
import ChannelInformationSidebarViewers from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarViewers.vue'
import type { UserId } from '/@/types/entity-ids'

withDefaults(
  defineProps<{
    viewerIds: readonly UserId[]
    inactiveViewerIds?: readonly UserId[]
    pinnedMessagesCount?: number
  }>(),
  {
    pinnedMessagesCount: 0
  }
)

const emit = defineEmits<{
  (e: 'moveToPinned'): void
  (e: 'moveToEvents'): void
}>()

const isViewersDetailOpen = ref(false)
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
