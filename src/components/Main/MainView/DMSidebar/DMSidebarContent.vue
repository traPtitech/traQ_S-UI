<template>
  <div>
    <channel-sidebar-viewers :viewer-ids="viewerIds" :class="$style.item" />
    <channel-sidebar-pinned
      :pinned-message-length="pinnedMessagesCount"
      @open="$emit('pinned-mode-toggle')"
      :class="$style.item"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ClipFolderId, UserId } from '@/types/entity-ids'
import ChannelSidebarPinned from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarPinned.vue'
import ChannelSidebarViewers from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarViewers.vue'

export default defineComponent({
  name: 'ClipsSidebarContent',
  components: {
    ChannelSidebarPinned,
    ChannelSidebarViewers
  },
  props: {
    channelId: { type: String as PropType<ClipFolderId>, required: true },
    viewerIds: {
      type: Array as PropType<UserId[]>,
      required: true
    },
    pinnedMessagesCount: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    return {}
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
}
</style>
