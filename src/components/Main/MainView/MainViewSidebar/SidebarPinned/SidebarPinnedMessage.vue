<template>
  <div>
    <router-link :to="constructMessagesPath(message.id)">
      <message-panel
        title-type="user"
        hide-subtitle
        line-clamp-content
        :message="message"
        show-context-menu-button
        @click-context-menu-button="toggle"
      />
    </router-link>
    <sidebar-pinned-message-context-menu
      v-if="position"
      :position="position"
      :message-id="message.id"
      :is-minimum="isArchived"
      @close="close"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue'
import { constructMessagesPath } from '/@/router'
import SidebarPinnedMessageContextMenu from './SidebarPinnedMessageContextMenu.vue'
import useContextMenu from '/@/composables/useContextMenu'
import { useChannelsStore } from '/@/store/entities/channels'

export default defineComponent({
  name: 'SidebarPinnedMessage',
  components: {
    MessagePanel,
    SidebarPinnedMessageContextMenu
  },
  props: {
    message: {
      type: Object as PropType<Message | ActivityTimelineMessage>,
      required: true
    }
  },
  setup(props) {
    const { position, toggle, close } = useContextMenu()
    const { channelsMap } = useChannelsStore()

    const isArchived = computed(
      () => channelsMap.value.get(props.message.channelId)?.archived ?? false
    )

    return {
      position,
      isArchived,
      constructMessagesPath,
      toggle,
      close
    }
  }
})
</script>
