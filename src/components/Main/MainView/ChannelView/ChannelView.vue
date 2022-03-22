<template>
  <primary-view-frame :is-ready="isReady">
    <template #header>
      <channel-header :channel-id="channelId" />
    </template>
    <template #default>
      <channel-view-content
        :channel-id="channelId"
        :entry-message-id="entryMessageId"
        :pinned-messages="pinnedMessages"
      />
    </template>
    <template #sidebar>
      <channel-sidebar
        :channel-id="channelId"
        :is-sidebar-opener-ready="isReady"
        :pinned-messages="pinnedMessages"
      />
    </template>
  </primary-view-frame>
</template>

<script lang="ts" setup>
import PrimaryViewFrame from '../PrimaryViewFrame.vue'
import ChannelHeader from './ChannelHeader/ChannelHeader.vue'
import ChannelViewContent from './ChannelViewContent/ChannelViewContent.vue'
import ChannelSidebar from './ChannelSidebar/ChannelSidebar.vue'
import { ChannelId, MessageId } from '/@/types/entity-ids'
import { toRef } from 'vue'
import usePinnedMessages from '/@/composables/message/usePinnedMessages'

const props = defineProps<{
  isReady: boolean
  channelId: ChannelId
  entryMessageId?: MessageId
}>()

const pinnedMessages = usePinnedMessages(toRef(props, 'channelId'))
</script>
