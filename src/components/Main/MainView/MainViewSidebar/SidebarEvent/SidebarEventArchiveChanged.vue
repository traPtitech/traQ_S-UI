<template>
  <sidebar-event-frame
    title="アーカイブ状態変更"
    icon-name="snowflake"
    icon-mdi
    show-chevron
  >
    <div :class="$style.newArchiveState">
      {{
        !details.visibility
          ? 'アーカイブされました'
          : 'アーカイブ解除されました'
      }}
    </div>
    <sidebar-event-changed-user :user-id="details.userId" />
  </sidebar-event-frame>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { VisibilityChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import SidebarEventChangedUser from './SidebarEventChangedUser.vue'

export default defineComponent({
  name: 'SidebarEventArchiveChanged',
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
      type: Object as PropType<VisibilityChangedEvent>,
      required: true
    }
  }
})
</script>

<style lang="scss" module>
.newArchiveState {
  @include color-ui-primary;
}
</style>
