<template>
  <div>
    <ChannelInformationSidebarViewers
      v-model="isViewersDetailOpen"
      :viewer-ids="viewerIds"
      :inactive-viewer-ids="inactiveViewerIds"
      :class="$style.sidebarItem"
    />
    <ChannelInformationSidebarQall
      v-if="qallUserIds.length > 0"
      :qall-user-ids="qallUserIds"
      :class="$style.sidebarItem"
    />
    <ChannelInformationSidebarTopic
      :class="$style.sidebarItem"
      :channel-id="channelId"
    />
    <ChannelInformationSidebarPinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.sidebarItem"
      @click-link="emit('moveToPinned')"
    />
    <ChannelInformationSidebarEvents
      :class="$style.sidebarItem"
      @click-link="emit('moveToEvents')"
    />
    <ChannelInformationSidebarRelation
      :channel-id="channelId"
      :class="$style.sidebarItem"
    />
    <ChannelInformationSidebarMember
      :channel-id="channelId"
      :class="$style.sidebarItem"
      :viewer-ids="viewerIds"
    />
    <ChannelInformationSidebarBots
      :channel-id="channelId"
      :class="$style.sidebarItem"
    />
    <!--
    <channel-sidebar-edit :class="$style.edit" />
    -->
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import ChannelInformationSidebarBots from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarBots.vue'
import ChannelInformationSidebarEvents from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarEvents.vue'
import ChannelInformationSidebarMember from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarMember.vue'
import ChannelInformationSidebarPinned from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarPinned.vue'
import ChannelInformationSidebarQall from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarQall.vue'
import ChannelInformationSidebarRelation from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarRelation.vue'
import ChannelInformationSidebarTopic from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarTopic.vue'
import ChannelInformationSidebarViewers from '/@/components/Main/MainView/ChannelView/ChannelSidebar/ChannelInformationSidebar/ChannelInformationSidebarViewers.vue'
import { useQall } from '/@/composables/qall/useQall'
import type { ChannelId, UserId } from '/@/types/entity-ids'

const isViewersDetailOpen = defineModel<boolean>('isViewersDetailOpen', {
  required: true
})

const props = withDefaults(
  defineProps<{
    channelId: ChannelId
    viewerIds: readonly UserId[]
    inactiveViewerIds: readonly UserId[]
    pinnedMessagesCount?: number
  }>(),
  {
    pinnedMessagesCount: 0
  }
)

const emit = defineEmits<{
  (e: 'moveToPinned'): void
  (e: 'moveToEvents'): void
}>()

const { rooms: roomWithParticipants } = useQall()

const qallUserIds = computed(
  () =>
    roomWithParticipants.value
      .find(room => room.channel.id === props.channelId)
      ?.participants?.map(participant => participant.user.id) ?? []
)
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
