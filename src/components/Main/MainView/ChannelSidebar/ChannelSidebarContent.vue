<template>
  <div>
    <channel-sidebar-viewers
      :viewer-ids="viewerIds"
      :class="$style.sidebarItem"
    />
    <channel-sidebar-topic :class="$style.sidebarItem" />
    <channel-sidebar-pinned
      :pinned-message-length="pinnedMessagesCount"
      @open="context.emit('pinned-mode-toggle')"
      :class="$style.sidebarItem"
    />
    <channel-sidebar-relation
      :channel-id="channelId"
      :class="$style.sidebarItem"
    />
    <channel-sidebar-member
      :channel-id="channelId"
      :class="$style.sidebarItem"
      :viewer-ids="viewerIds"
    />
    <channel-sidebar-edit :class="$style.edit" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import ChannelSidebarTopic from './ChannelSidebarTopic.vue'
import ChannelSidebarPinned from './ChannelSidebarPinned.vue'
import ChannelSidebarViewers from './ChannelSidebarViewers.vue'
import ChannelSidebarMember from './ChannelSidebarMember.vue'
import ChannelSidebarEdit from './ChannelSidebarEdit.vue'
import ChannelSidebarRelation from './ChannelSidebarRelation.vue'
import { UserId, ChannelId } from '@/types/entity-ids'

export default defineComponent({
  name: 'ChannelSidebarContent',
  props: {
    channelId: { type: String as PropType<ChannelId>, requried: true },
    viewerIds: {
      type: Array as PropType<UserId[]>,
      required: true
    },
    pinnedMessagesCount: {
      type: Number,
      default: 0
    }
  },
  components: {
    ChannelSidebarTopic,
    ChannelSidebarPinned,
    ChannelSidebarViewers,
    ChannelSidebarMember,
    ChannelSidebarEdit,
    ChannelSidebarRelation
  },
  setup(_, context) {
    return { context }
  }
})
</script>

<style lang="scss" module>
.sidebarItem {
  margin: 16px 0;
}

.edit {
  margin: 24px 0;
  flex: 1;
  align-items: flex-end;
}
</style>
