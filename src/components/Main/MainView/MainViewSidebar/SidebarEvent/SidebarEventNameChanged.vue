<template>
  <sidebar-event-frame title="チャンネル名変更" icon-name="hash" show-chevron>
    <div :class="$style.newName" :data-is-empty="details.after === ''">
      {{ details.after }}
    </div>
    <sidebar-event-changed-user :user-id="details.userId" />
  </sidebar-event-frame>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { NameChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import SidebarEventChangedUser from './SidebarEventChangedUser.vue'

export default defineComponent({
  name: 'SidebarEventNameChanged',
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
      type: Object as PropType<NameChangedEvent>,
      required: true
    }
  }
})
</script>

<style lang="scss" module>
.newName {
  @include color-ui-primary;
  &[data-is-empty='true'] {
    opacity: 0.5;
  }
}
</style>
