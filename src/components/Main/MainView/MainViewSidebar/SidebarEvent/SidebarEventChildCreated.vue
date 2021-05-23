<template>
  <sidebar-event-frame title="子チャンネル作成" icon-name="hash" show-chevron>
    <div :class="$style.newChildPath">
      {{ newChildPath }}
    </div>
    <sidebar-event-changed-user :user-id="details.userId" />
  </sidebar-event-frame>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ChildCreatedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import SidebarEventChangedUser from './SidebarEventChangedUser.vue'
import useChannelPath from '@/use/channelPath'

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
      type: Object as PropType<ChildCreatedEvent>,
      required: true
    }
  },
  setup(props) {
    const { channelIdToShortPathString } = useChannelPath()
    const newChildPath = computed(() =>
      channelIdToShortPathString(props.details.channelId, true)
    )
    return { newChildPath }
  }
})
</script>

<style lang="scss" module>
.newChildPath {
  @include color-ui-primary;
}
</style>
