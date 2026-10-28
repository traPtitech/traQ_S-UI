<template>
  <InfomationSidebarEventFrame
    title="チャンネル名変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{ details.after }}
  </InfomationSidebarEventFrame>
</template>

<script lang="ts" setup>
import type { NameChangedEvent } from '@traptitech/traq'

import InfomationSidebarEventFrame from './InfomationSidebarEventFrame.vue'

defineProps<{
  datetime: string
  details: NameChangedEvent
}>()
</script>
