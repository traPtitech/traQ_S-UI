<template>
  <PrimaryViewFrame :is-ready="isReady">
    <template #header>
      <ChannelHeader :channel-id="channelId" />
    </template>
    <template #default>
      <QallView v-if="getQallingState(channelId) === 'mainView'" />
      <ChannelViewContent
        v-else
        :channel-id="channelId"
        :entry-message-id="entryMessageId"
        :pinned-messages="pinnedMessages"
        :typing-users="typingUsers"
      />
    </template>
    <template #sidebar>
      <ChannelSidebar
        v-if="getQallingState(channelId) !== 'mainView'"
        :channel-id="channelId"
        :is-sidebar-opener-ready="isReady"
        :pinned-messages="pinnedMessages"
        :active-viewing-users="activeViewingUsers"
        :inactive-viewing-users="inactiveViewingUsers"
      />
    </template>
  </PrimaryViewFrame>
</template>

<script lang="ts" setup>
import PrimaryViewFrame from '../PrimaryViewFrame.vue'
import ChannelHeader from './ChannelHeader/ChannelHeader.vue'
import ChannelViewContent from './ChannelViewContent/ChannelViewContent.vue'
import ChannelSidebar from './ChannelSidebar/ChannelSidebar.vue'
import type { ChannelId, MessageId } from '/@/types/entity-ids'
import { toRef } from 'vue'
import usePinnedMessages from '/@/composables/message/usePinnedMessages'
import useCurrentViewers from '/@/composables/useCurrentViewers'
import { useQall } from '/@/composables/qall/useQall'
import QallView from '../QallView/QallView.vue'

const props = defineProps<{
  isReady: boolean
  channelId: ChannelId
  entryMessageId?: MessageId
}>()

const channelId = toRef(props, 'channelId')
const pinnedMessages = usePinnedMessages(channelId)

const { activeViewingUsers, inactiveViewingUsers, typingUsers } =
  useCurrentViewers(channelId)
const { getQallingState } = useQall()
</script>
