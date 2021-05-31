<template>
  <message-panel
    :message="message"
    :title-type="titleType"
    line-clamp-content
    @click="onChannelSelect(message.channelId)"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ActivityTimelineMessage } from '@traptitech/traq'
import useChannelSelect from '@/use/channelSelect'
import MessagePanel from '@/components/UI/MessagePanel/MessagePanel.vue'

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
    const { onChannelSelect } = useChannelSelect()

    const titleType = computed(() =>
      props.type === 'channel' ? 'channel' : 'user'
    )

    return { onChannelSelect, titleType }
  }
})
</script>
