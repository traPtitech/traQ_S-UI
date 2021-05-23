<template>
  <sidebar-event-frame
    title="チャンネル名変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{ details.after }}
  </sidebar-event-frame>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { NameChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'

export default defineComponent({
  name: 'SidebarEventNameChanged',
  components: {
    SidebarEventFrame
  },
  props: {
    datetime: {
      type: String,
      required: true
    },
    details: {
      type: Object as PropType<NameChangedEvent>,
      required: true
    }
  }
})
</script>
