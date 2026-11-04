<template>
  <InformationSidebarEventFrame
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
  </InformationSidebarEventFrame>
</template>

<script lang="ts" setup>
import type { ForcedNotificationChangedEvent } from '@traptitech/traq'

import InformationSidebarEventFrame from './InformationSidebarEventFrame.vue'

defineProps<{
  datetime: string
  details: ForcedNotificationChangedEvent
}>()
</script>
