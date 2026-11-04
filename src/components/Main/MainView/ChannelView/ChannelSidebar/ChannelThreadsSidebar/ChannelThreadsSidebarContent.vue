<template>
  <div>
    <ChannelThreadsSidebarNotification :class="$style.sidebarItem" />
    <ChannelThreadsSidebarThreads
      :channel-id="channelId"
      :class="$style.sidebarItem"
    />
  </div>
</template>

<script setup lang="ts">
import ChannelThreadsSidebarNotification from './ChannelThreadsSidebarNotification.vue'
import ChannelThreadsSidebarThreads from './ChannelThreadsSidebarThreads.vue'

defineProps<{
  channelId: string
}>()
</script>

<style lang="scss" module>
.sidebarItem {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
