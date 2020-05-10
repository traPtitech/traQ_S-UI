<template>
  <message-panel
    title-type="user"
    hide-subtitle
    line-clamp-content
    :message="message"
    @click="onMessageSelect"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { Message } from '@traptitech/traq'
import MessagePanel from '@/components/UI/MessagePanel/MessagePanel.vue'

export default defineComponent({
  name: 'ChannelSidebarPinnedListItem',
  components: { MessagePanel },
  props: {
    message: {
      type: Object as PropType<Message>,
      required: true
    }
  },
  setup(props, context) {
    const onMessageSelect = () => {
      context.root.$router.push(`/messages/${props.message.id}`)
    }

    return { onMessageSelect }
  }
})
</script>
