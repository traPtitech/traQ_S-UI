<template>
  <sidebar-event-frame title="強制通知状態変更" icon-name="forced" show-chevron>
    <div :class="$style.newForcedNotificationState">
      {{
        !details.force
          ? '強制通知チャンネルに変更されました'
          : '強制通知チャンネルから解除されました'
      }}
    </div>
    <sidebar-event-changed-user :user-id="details.userId" />
  </sidebar-event-frame>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ForcedNotificationChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import SidebarEventChangedUser from './SidebarEventChangedUser.vue'

export default defineComponent({
  name: 'SidebarEventForcedNotificationChanged',
  components: {
    SidebarEventFrame,
    SidebarEventChangedUser
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

<style lang="scss" module>
.newForcedNotificationState {
  @include color-ui-primary;
}
</style>
