<template>
  <message-panel
    line-clamp-content
    :message="message"
    show-context-menu-button
    @context-menu-clicked="toggleContextMenu"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import { useMessageContextMenuInvoker } from '../providers/messageContextMenu'
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import store from '/@/store'

export default defineComponent({
  name: 'SidebarPinnedMessage',
  components: { MessagePanel },
  props: {
    message: {
      type: Object as PropType<Message | ActivityTimelineMessage>,
      required: true
    }
  },
  setup(props) {
    const isArchived = computed(
      () =>
        store.state.entities.channelsMap.get(props.message.channelId)
          ?.archived ?? false
    )

    const toggleContextMenu = computed(() => {
      const { toggleContextMenu } = useMessageContextMenuInvoker({
        messageId: props.message.id,
        isMinimum: isArchived.value
      })

      return toggleContextMenu
    })

    return { toggleContextMenu }
  }
})
</script>
