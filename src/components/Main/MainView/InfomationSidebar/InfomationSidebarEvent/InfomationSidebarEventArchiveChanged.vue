<template>
  <InfomationSidebarEventFrame
    title="アーカイブ状態変更"
    icon-name="snowflake"
    icon-mdi
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{
      !details.visibility ? 'アーカイブされました' : 'アーカイブ解除されました'
    }}
  </InfomationSidebarEventFrame>
</template>

<script lang="ts" setup>
import type { VisibilityChangedEvent } from '@traptitech/traq'

import InfomationSidebarEventFrame from './InfomationSidebarEventFrame.vue'

defineProps<{
  datetime: string
  details: VisibilityChangedEvent
}>()
</script>
