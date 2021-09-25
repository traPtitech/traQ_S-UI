<template>
  <sidebar-event-frame
    title="子チャンネル作成"
    icon-name="hash"
    :user-id="details.userId"
    :datetime="datetime"
    :link="newChildLink"
  >
    {{ newChildPath }}
  </sidebar-event-frame>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ChildCreatedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import useChannelPath from '/@/use/channelPath'

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
      type: Object as PropType<ChildCreatedEvent>,
      required: true
    }
  },
  setup(props) {
    const { channelIdToShortPathString, channelIdToLink } = useChannelPath()

    const newChildPath = computed(() =>
      channelIdToShortPathString(props.details.channelId, true)
    )

    const newChildLink = channelIdToLink(props.details.channelId)

    return { newChildPath, newChildLink }
  }
})
</script>
