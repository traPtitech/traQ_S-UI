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

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ForcedNotificationChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'

export default defineComponent({
  name: 'SidebarEventForcedNotificationChanged',
  components: {
    SidebarEventFrame
  },
  props: {
    datetime: {
      type: String,
      required: true
    },
    details: {
      type: Object as PropType<ForcedNotificationChangedEvent>,
      required: true
    }
  }
})
</script>
