<template>
  <router-link :to="constructMessagesPath(message.id)">
    <message-panel
      title-type="user"
      hide-subtitle
      line-clamp-content
      :message="message"
      show-context-menu-button
      @context-menu-clicked="toggleContextMenu"
    />
  </router-link>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue'
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import { useMessageContextMenuInvoker } from '../providers/messageContextMenu'
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import store from '/@/store'
import { constructMessagesPath } from '/@/router'

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

    const { toggleContextMenu } = useMessageContextMenuInvoker(
      reactive({
        messageId: props.message.id,
        isMinimum: isArchived.value
      })
    )

    return { constructMessagesPath, toggleContextMenu }
  }
})
</script>
