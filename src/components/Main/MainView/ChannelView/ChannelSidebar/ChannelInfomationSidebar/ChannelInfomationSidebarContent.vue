<template>
  <div>
    <ChannelInfomationSidebarViewers
      v-model="isViewersDetailOpen"
      :viewer-ids="viewerIds"
      :inactive-viewer-ids="inactiveViewerIds"
      :class="$style.sidebarItem"
    />
    <ChannelInfomationSidebarQall
      v-if="qallUserIds.length > 0"
      :qall-user-ids="qallUserIds"
      :class="$style.sidebarItem"
    />
    <ChannelInfomationSidebarTopic
      :class="$style.sidebarItem"
      :channel-id="channelId"
    />
    <ChannelInfomationSidebarPinned
      :pinned-message-length="pinnedMessagesCount"
      :class="$style.sidebarItem"
      @click-link="emit('moveToPinned')"
    />
    <ChannelInfomationSidebarEvents
      :class="$style.sidebarItem"
      @click-link="emit('moveToEvents')"
    />
    <ChannelInfomationSidebarRelation
      :channel-id="channelId"
      :class="$style.sidebarItem"
    />
    <ChannelInfomationSidebarMember
      :channel-id="channelId"
      :class="$style.sidebarItem"
      :viewer-ids="viewerIds"
    />
    <ChannelInfomationSidebarBots
      :channel-id="channelId"
      :class="$style.sidebarItem"
    />
    <!--
    <channel-infomation-sidebar-edit :class="$style.edit" />
    -->
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useQall } from '/@/composables/qall/useQall'
import type { ChannelId, UserId } from '/@/types/entity-ids'

import ChannelInfomationSidebarBots from './ChannelInfomationSidebarBots.vue'
import ChannelInfomationSidebarEvents from './ChannelInfomationSidebarEvents.vue'
import ChannelInfomationSidebarMember from './ChannelInfomationSidebarMember.vue'
import ChannelInfomationSidebarPinned from './ChannelInfomationSidebarPinned.vue'
import ChannelInfomationSidebarQall from './ChannelInfomationSidebarQall.vue'
import ChannelInfomationSidebarRelation from './ChannelInfomationSidebarRelation.vue'
import ChannelInfomationSidebarTopic from './ChannelInfomationSidebarTopic.vue'
import ChannelInfomationSidebarViewers from './ChannelInfomationSidebarViewers.vue'

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
