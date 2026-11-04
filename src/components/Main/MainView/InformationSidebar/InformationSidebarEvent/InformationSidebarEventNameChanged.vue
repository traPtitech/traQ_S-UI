<template>
  <InformationSidebarEventFrame
    title="チャンネル名変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{ details.after }}
  </InformationSidebarEventFrame>
</template>

<script lang="ts" setup>
import type { NameChangedEvent } from '@traptitech/traq'

import InformationSidebarEventFrame from './InformationSidebarEventFrame.vue'

defineProps<{
  datetime: string
  details: NameChangedEvent
}>()
</script>
