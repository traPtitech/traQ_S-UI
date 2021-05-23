<template>
  <sidebar-event-frame
    title="親チャンネル変更"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
  >
    {{ newParentPath }}
  </sidebar-event-frame>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ParentChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import useChannelPath from '@/use/channelPath'

export default defineComponent({
  name: 'SidebarEventParentChanged',
  components: {
    SidebarEventFrame
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
