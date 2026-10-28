<template>
  <div>
    <ChannelThreadsSidebarNotification
      :class="$style.sidebarItem"
      :default-notification="defaultNotification"
      @click-link="emit('moveToNotification')"
    />
  </div>
</template>

<script lang="ts" setup>
import ChannelThreadsSidebarNotification from './ChannelThreadsSidebarNotification.vue'

defineProps<{
  defaultNotification: string
}>()

const emit = defineEmits<{
  (e: 'moveToNotification'): void
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
