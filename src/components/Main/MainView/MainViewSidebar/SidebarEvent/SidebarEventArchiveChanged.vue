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

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { VisibilityChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'

export default defineComponent({
  name: 'SidebarEventArchiveChanged',
  components: {
    SidebarEventFrame
  },
  props: {
    datetime: {
      type: String,
      required: true
    },
    details: {
      type: Object as PropType<VisibilityChangedEvent>,
      required: true
    }
  }
})
</script>
