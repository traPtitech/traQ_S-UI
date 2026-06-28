<template>
  <SidebarEventFrame
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
  </SidebarEventFrame>
</template>

<script lang="ts" setup>
import type { ForcedNotificationChangedEvent } from '@traptitech/traq'

import SidebarEventFrame from './SidebarEventFrame.vue'

defineProps<{
  datetime: string
  details: ForcedNotificationChangedEvent
}>()
</script>
