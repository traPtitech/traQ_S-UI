<template>
  <sidebar-event-frame title="親チャンネル変更" icon-name="hash" show-chevron>
    <div :class="$style.newParentPath">
      {{ newParentPath }}
    </div>
    <sidebar-event-changed-user :user-id="details.userId" />
  </sidebar-event-frame>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ParentChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import SidebarEventChangedUser from './SidebarEventChangedUser.vue'
import useChannelPath from '@/use/channelPath'

export default defineComponent({
  name: 'SidebarEventParentChanged',
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
      type: Object as PropType<ParentChangedEvent>,
      required: true
    }
  },
  setup(props) {
    const { channelIdToPathString } = useChannelPath()

    const newParentPath = computed(() =>
      channelIdToPathString(props.details.after, true)
    )

    return { newParentPath }
  }
})
</script>

<style lang="scss" module>
.newParentPath {
  @include color-ui-primary;
}
</style>
