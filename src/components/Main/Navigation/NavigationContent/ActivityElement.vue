<template>
  <message-panel
    @click="onChannelSelect(message.channelId)"
    :message="message"
    :title-type="titleType"
    line-clamp-content
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import { Message } from '@traptitech/traq'
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
      type: Object as PropType<Message>,
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
