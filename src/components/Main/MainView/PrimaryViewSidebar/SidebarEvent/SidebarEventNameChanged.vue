<template>
  <SidebarEventFrame
    title="チャンネル名変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{ details.after }}
  </SidebarEventFrame>
</template>

<script lang="ts" setup>
import type { NameChangedEvent } from '@traptitech/traq'

import SidebarEventFrame from './SidebarEventFrame.vue'

defineProps<{
  datetime: string
  details: NameChangedEvent
}>()
</script>
