<template>
  <div>
    <ChannelSidebarViewers
      v-model="isViewersDetailOpen"
      :viewer-ids="viewerIds"
      :inactive-viewer-ids="inactiveViewerIds"
      :class="$style.item"
    />
    <ChannelSidebarPinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.item"
      @click-link="emit('moveToPinned')"
    />
    <ChannelSidebarEvents
      :class="$style.item"
      @click-link="emit('moveToEvents')"
    />
  </div>
</template>

<script lang="ts" setup>
import ChannelSidebarPinned from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelSidebarPinned.vue'
import ChannelSidebarViewers from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelSidebarViewers.vue'
import ChannelSidebarEvents from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelSidebarEvents.vue'
import type { UserId } from '/@/types/entity-ids'
import { ref } from 'vue'

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
