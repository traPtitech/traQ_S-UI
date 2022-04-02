<template>
  <sidebar-event-frame
    title="チャンネル名変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{ details.after }}
  </sidebar-event-frame>
</template>

<script lang="ts" setup>
import SidebarEventFrame from './SidebarEventFrame.vue'
import type { NameChangedEvent } from '@traptitech/traq'

defineProps<{
  datetime: string
  details: NameChangedEvent
}>()
</script>
