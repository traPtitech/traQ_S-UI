<template>
  <router-link :to="channelLink">
    <message-panel
      :message="message"
      :title-type="titleType"
      line-clamp-content
    />
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ActivityTimelineMessage } from '@traptitech/traq'
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import useChannelPath from '/@/use/channelPath'

export default defineComponent({
  name: 'ActivityElement',
  components: {
    MessagePanel
  },
  props: {
    type: {
      type: String as PropType<'channel' | 'message'>,
      required: true
    },
    message: {
      type: Object as PropType<ActivityTimelineMessage>,
      required: true
    }
  },
  setup(props) {
    const { channelIdToLink } = useChannelPath()

    const titleType = computed(() =>
      props.type === 'channel' ? 'channel' : 'user'
    )
    const channelLink = computed(() => channelIdToLink(props.message.channelId))

    return { titleType, channelLink }
  }
})
</script>
