<template>
  <div :class="$style.container">
    <sidebar-pinned-message
      v-for="message in sortedMessages"
      :key="message.id"
      :message="message"
      :class="$style.item"
    />
    <div v-if="sortedMessages.length <= 0" :class="$style.noPinned">
      ピン留めされたメッセージはありません
    </div>
    <message-tools-menu-container
      v-if="isShown"
      :position="state.position"
      @close-context-menu="closeContextMenu"
    >
      <sidebar-pinned-tools-menu :message-id="state.target" />
    </message-tools-menu-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Pin } from '@traptitech/traq'
import SidebarPinnedMessage from './SidebarPinnedMessage.vue'
import MessageToolsMenuContainer from '/@/components/UI/MessagePanel/MessageToolsMenuContainer.vue'
import { constructMessagesPath } from '/@/router'
import { useMessageContextMenuStore } from '../providers/messageContextMenu'
import SidebarPinnedToolsMenu from './SidebarPinnedToolsMenu.vue'

export default defineComponent({
  name: 'SidebarPinnedList',
  components: {
    SidebarPinnedMessage,
    MessageToolsMenuContainer,
    SidebarPinnedToolsMenu
  },
  props: {
    pinnedMessages: {
      type: Array as PropType<Pin[]>,
      default: () => []
    }
  },
  setup(props) {
    // provideMessageContextMenuStore()

    const sortedMessages = computed(() =>
      [...props.pinnedMessages]
        .sort((a, b) => Date.parse(b.pinnedAt) - Date.parse(a.pinnedAt))
        .map(pinnedMessage => pinnedMessage.message)
    )

    const { state, isShown, closeContextMenu } = useMessageContextMenuStore()

    return {
      sortedMessages,
      constructMessagesPath,
      state,
      isShown,
      closeContextMenu,
      useMessageContextMenuStore
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
}

.item {
  display: block;
}
.item + .item {
  margin-top: 16px;
}

.noPinned {
  @include color-ui-tertiary;
}
</style>
