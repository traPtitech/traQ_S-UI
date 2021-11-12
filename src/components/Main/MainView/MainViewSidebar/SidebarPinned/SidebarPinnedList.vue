<template>
  <div :class="$style.container">
    <router-link
      v-for="message in sortedMessages"
      :key="message.id"
      :to="constructMessagesPath(message.id)"
    >
      <sidebar-pinned
        line-clamp-content
        :message="message"
        :class="$style.item"
      />
    </router-link>
    <div v-if="sortedMessages.length <= 0" :class="$style.noPinned">
      ピン留めされたメッセージはありません
    </div>
    <sidebar-pinned-tools-menu-container />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Pin } from '@traptitech/traq'
import SidebarPinned from './SidebarPinned.vue'
import SidebarPinnedToolsMenuContainer from './SidebarPinnedToolsMenuContainer.vue'
import { constructMessagesPath } from '/@/router'
import { provideMessageContextMenuStore } from '../providers/messageContextMenu'

export default defineComponent({
  name: 'SidebarPinnedList',
  components: { SidebarPinned, SidebarPinnedToolsMenuContainer },
  props: {
    pinnedMessages: {
      type: Array as PropType<Pin[]>,
      default: () => []
    }
  },
  setup(props) {
    provideMessageContextMenuStore()

    const sortedMessages = computed(() =>
      [...props.pinnedMessages]
        .sort((a, b) => Date.parse(b.pinnedAt) - Date.parse(a.pinnedAt))
        .map(pinnedMessage => pinnedMessage.message)
    )
    return { sortedMessages, constructMessagesPath }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
}

.item {
  margin-top: 16px;
}

.noPinned {
  @include color-ui-tertiary;
}
</style>
