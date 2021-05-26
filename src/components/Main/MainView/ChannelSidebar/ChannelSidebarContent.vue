<template>
  <div>
    <channel-sidebar-viewers
      :viewer-ids="viewerIds"
      :class="$style.sidebarItem"
    />
    <channel-sidebar-qall
      v-if="qallUserIds.length > 0"
      :qall-user-ids="qallUserIds"
      :class="$style.sidebarItem"
    />
    <channel-sidebar-topic
      :class="$style.sidebarItem"
      :channel-id="channelId"
    />
    <channel-sidebar-pinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.sidebarItem"
      @open="emit('moveToPinned')"
    />
    <channel-sidebar-events
      :class="$style.sidebarItem"
      @open="emit('moveToEvents')"
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
    <channel-sidebar-bots :channel-id="channelId" :class="$style.sidebarItem" />
    <!--
    <channel-sidebar-edit :class="$style.edit" />
    -->
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import ChannelSidebarTopic from './ChannelSidebarTopic.vue'
import ChannelSidebarPinned from './ChannelSidebarPinned.vue'
import ChannelSidebarViewers from './ChannelSidebarViewers.vue'
import ChannelSidebarMember from './ChannelSidebarMember.vue'
//import ChannelSidebarEdit from './ChannelSidebarEdit.vue'
import ChannelSidebarEvents from './ChannelSidebarEvents.vue'
import ChannelSidebarRelation from './ChannelSidebarRelation.vue'
import ChannelSidebarQall from './ChannelSidebarQall.vue'
import ChannelSidebarBots from './ChannelSidebarBots.vue'
import { UserId, ChannelId } from '@/types/entity-ids'
import { useQallSession } from './use/channelRTCSession'

export default defineComponent({
  name: 'ChannelSidebarContent',
  components: {
    ChannelSidebarTopic,
    ChannelSidebarPinned,
    ChannelSidebarViewers,
    ChannelSidebarMember,
    ChannelSidebarEvents,
    //ChannelSidebarEdit,
    ChannelSidebarRelation,
    ChannelSidebarQall,
    ChannelSidebarBots
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    },
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
    const { sessionUserIds: qallUserIds } = useQallSession(props)

    return { qallUserIds, emit }
  }
})
</script>

<style lang="scss" module>
.sidebarItem {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}

.edit {
  margin: 24px 0;
  flex: 1;
  align-items: flex-end;
}
</style>
