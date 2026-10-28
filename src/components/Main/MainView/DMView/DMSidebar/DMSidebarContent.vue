<template>
  <div>
    <ChannelInfomationSidebarViewers
      v-model="isViewersDetailOpen"
      :viewer-ids="viewerIds"
      :inactive-viewer-ids="inactiveViewerIds"
      :class="$style.item"
    />
    <ChannelInfomationSidebarPinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.item"
      @click-link="emit('moveToPinned')"
    />
    <ChannelInfomationSidebarEvents
      :class="$style.item"
      @click-link="emit('moveToEvents')"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import ChannelInfomationSidebarEvents from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInfomationSidebar/ChannelInfomationSidebarEvents.vue'
import ChannelInfomationSidebarPinned from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInfomationSidebar/ChannelInfomationSidebarPinned.vue'
import ChannelInfomationSidebarViewers from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInfomationSidebar/ChannelInfomationSidebarViewers.vue'
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
