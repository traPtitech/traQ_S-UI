<template>
  <sidebar-event-frame
    title="購読者変更"
    icon-name="notified"
    :user-id="details.userId"
    :datetime="datetime"
  >
    <div v-if="details.on.length > 0">
      <div :class="$style.label">新しい購読者</div>
      <user-icon-ellipsis-list direction="row" :user-ids="details.on" />
    </div>
    <div v-if="details.off.length > 0">
      <div :class="$style.label">解除した購読者</div>
      <user-icon-ellipsis-list direction="row" :user-ids="details.off" />
    </div>
  </sidebar-event-frame>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { SubscribersChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import UserIconEllipsisList from '@/components/UI/UserIconEllipsisList.vue'

export default defineComponent({
  name: 'SidebarEventSubscribersChanged',
  components: {
    SidebarEventFrame,
    UserIconEllipsisList
  },
  props: {
    datetime: {
      type: String,
      required: true
    },
    details: {
      type: Object as PropType<SubscribersChangedEvent>,
      required: true
    }
  }
})
</script>

<style lang="scss" module>
.label {
  @include color-ui-secondary;
  font-weight: bold;
}
</style>
