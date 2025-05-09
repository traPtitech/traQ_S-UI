<template>
  <primary-view-frame :is-ready="isReady">
    <template #header>
      <d-m-header :user-name="userName" />
    </template>
    <template #default>
      <channel-view-content
        :channel-id="channelId"
        :entry-message-id="entryMessageId"
        :pinned-messages="pinnedMessages"
        :typing-users="typingUsers"
      />
    </template>
    <template #sidebar>
      <d-m-sidebar
        :channel-id="channelId"
        :user-name="userName"
        :is-sidebar-opener-ready="isReady"
        :pinned-messages="pinnedMessages"
        :active-viewing-users="activeViewingUsers"
        :inactive-viewing-users="inactiveViewingUsers"
      />
    </template>
  </primary-view-frame>
</template>

<script lang="ts" setup>
import PrimaryViewFrame from '../PrimaryViewFrame.vue'
import DMHeader from './DMHeader/DMHeader.vue'
import ChannelViewContent from '../ChannelView/ChannelViewContent/ChannelViewContent.vue'
import DMSidebar from './DMSidebar/DMSidebar.vue'
import type { ChannelId, MessageId } from '/@/types/entity-ids'
import { toRef } from 'vue'
import usePinnedMessages from '/@/composables/message/usePinnedMessages'
import useCurrentViewers from '/@/composables/useCurrentViewers'

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
