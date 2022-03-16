<template>
  <sidebar-event-frame
    title="強制通知状態変更"
    icon-name="forced"
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{
      !details.force
        ? '強制通知チャンネルに変更されました'
        : '強制通知チャンネルから解除されました'
    }}
  </sidebar-event-frame>
</template>

<script lang="ts" setup>
import SidebarEventFrame from './SidebarEventFrame.vue';
import { ForcedNotificationChangedEvent } from '@traptitech/traq'

defineProps<{
    datetime: string,
    details: ForcedNotificationChangedEvent
}>()
</script>
