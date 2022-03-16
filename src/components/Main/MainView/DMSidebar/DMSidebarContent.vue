<template>
  <div>
    <channel-sidebar-viewers :viewer-ids="viewerIds" :class="$style.item" />
    <channel-sidebar-pinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.item"
      @open="moveToPinned"
    />
    <channel-sidebar-events :class="$style.item" @click-link="moveToEvents" />
  </div>
</template>

<script lang="ts" setup>
import ChannelSidebarPinned from '/@/components/Main/MainView/ChannelSidebar/ChannelSidebarPinned.vue'
import ChannelSidebarViewers from '/@/components/Main/MainView/ChannelSidebar/ChannelSidebarViewers.vue'
import ChannelSidebarEvents from '/@/components/Main/MainView/ChannelSidebar/ChannelSidebarEvents.vue'
import { UserId } from '/@/types/entity-ids'

withDefaults(
  defineProps<{
    viewerIds: readonly UserId[]
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

const moveToPinned = () => {
  emit('moveToPinned')
}
const moveToEvents = () => {
  emit('moveToEvents')
}
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
