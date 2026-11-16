<template>
  <div :class="$style.container">
    <ChannelThreadsSidebarNotification />
    <ChannelThreadsSidebarThreads :channel-id="channelId" />
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
.container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
