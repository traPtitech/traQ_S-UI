<template>
  <div>
    <channel-sidebar-viewers :viewer-ids="viewerIds" :class="$style.item" />
    <channel-sidebar-pinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.item"
      @open="emit('moveToPinned')"
    />
    <channel-sidebar-events :class="$style.item" @open="emit('moveToEvents')" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { UserId } from '@/types/entity-ids'
import ChannelSidebarPinned from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarPinned.vue'
import ChannelSidebarViewers from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarViewers.vue'
import ChannelSidebarEvents from '@/components/Main/MainView/ChannelSidebar/ChannelSidebarEvents.vue'

export default defineComponent({
  name: 'DMSidebarContent',
  components: {
    ChannelSidebarPinned,
    ChannelSidebarViewers,
    ChannelSidebarEvents
  },
  props: {
    viewerIds: {
      type: Array as PropType<UserId[]>,
      required: true
    },
    pinnedMessagesCount: {
      type: Number,
      default: 0
    }
  },
  setup(props, { emit }) {
    return { emit }
  }
})
</script>

<style lang="scss" module>
.item {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
