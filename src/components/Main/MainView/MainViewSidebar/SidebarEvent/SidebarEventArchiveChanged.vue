<template>
  <sidebar-event-frame
    title="アーカイブ状態変更"
    icon-name="snowflake"
    icon-mdi
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{
      !details.visibility ? 'アーカイブされました' : 'アーカイブ解除されました'
    }}
  </sidebar-event-frame>
</template>

<script lang="ts" setup>
import SidebarEventFrame from './SidebarEventFrame.vue'
import { VisibilityChangedEvent } from '@traptitech/traq'

defineProps<{
  datetime: string
  details: VisibilityChangedEvent
}>()
</script>
