<template>
  <primary-view-frame :is-ready="isReady">
    <template #header>
      <d-m-header :user-name="userName" />
    </template>
    <template #default>
      <channel-view-content
        :channel-id="channelId"
        :entry-message-id="entryMessageId"
      />
    </template>
    <template #sidebar>
      <d-m-sidebar
        :channel-id="channelId"
        :user-name="userName"
        :is-sidebar-opener-ready="isReady"
      />
    </template>
  </primary-view-frame>
</template>

<script lang="ts" setup>
import PrimaryViewFrame from '../PrimaryViewFrame.vue'
import DMHeader from './DMHeader/DMHeader.vue'
import ChannelViewContent from '../ChannelView/ChannelViewContent/ChannelViewContent.vue'
import DMSidebar from './DMSidebar/DMSidebar.vue'
import { ChannelId, MessageId } from '/@/types/entity-ids'

defineProps<{
  isReady: boolean
  channelId: ChannelId
  entryMessageId?: MessageId
  userName: string
}>()
</script>
