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

<script lang="ts" setup>
import MessagePanel from '/@/components/UI/MessagePanel/MessagePanel.vue';
import SidebarPinnedMessageContextMenu from './SidebarPinnedMessageContextMenu.vue';
import { computed } from 'vue';
import { ActivityTimelineMessage, Message } from '@traptitech/traq'
import { constructMessagesPath } from '/@/router'
import useContextMenu from '/@/composables/useContextMenu'
import { useChannelsStore } from '/@/store/entities/channels'

const props = defineProps<{
    message: Message | ActivityTimelineMessage
}>();

const { position, toggle, close } = useContextMenu()
const { channelsMap } = useChannelsStore()

const isArchived = computed(
  () => channelsMap.value.get(props.message.channelId)?.archived ?? false
)
</script>
