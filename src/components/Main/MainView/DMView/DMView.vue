<template>
  <PrimaryViewFrame :is-ready="isReady">
    <template #header>
      <DMHeader :user-name="userName" />
    </template>
    <template #default>
      <ChannelViewContent
        :channel-id="channelId"
        :entry-message-id="entryMessageId"
        :pinned-messages="pinnedMessages"
        :typing-users="typingUsers"
      />
    </template>
    <template #sidebar>
      <DMSidebar
        :channel-id="channelId"
        :user-name="userName"
        :is-sidebar-opener-ready="isReady"
        :pinned-messages="pinnedMessages"
        :active-viewing-users="activeViewingUsers"
        :inactive-viewing-users="inactiveViewingUsers"
      />
    </template>
  </PrimaryViewFrame>
</template>

<script lang="ts" setup>
import { toRef } from 'vue'

import usePinnedMessages from '/@/composables/message/usePinnedMessages'
import useCurrentViewers from '/@/composables/useCurrentViewers'
import type { ChannelId, MessageId } from '/@/types/entity-ids'

import ChannelViewContent from '../ChannelView/ChannelViewContent/ChannelViewContent.vue'
import PrimaryViewFrame from '../PrimaryViewFrame.vue'
import DMHeader from './DMHeader/DMHeader.vue'
import DMSidebar from './DMSidebar/DMSidebar.vue'

const props = defineProps<{
  isReady: boolean
  channelId: ChannelId
  entryMessageId?: MessageId
  userName: string
}>()

const channelId = toRef(props, 'channelId')
const pinnedMessages = usePinnedMessages(channelId)
const { activeViewingUsers, inactiveViewingUsers, typingUsers } =
  useCurrentViewers(channelId)
</script>
