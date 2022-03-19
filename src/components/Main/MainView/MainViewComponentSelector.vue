<template>
  <channel-view-content
    v-if="viewInfo.type === 'channel' || viewInfo.type === 'dm'"
    :channel-id="viewInfo.channelId"
    :entry-message-id="viewInfo.entryMessageId"
  />
  <clips-view-content
    v-else-if="viewInfo.type === 'clips'"
    :clip-folder-id="viewInfo.clipFolderId"
  />
  <null-view v-else />
</template>

<script lang="ts" setup>
import ChannelViewContent from '/@/components/Main/MainView/ChannelViewContent/ChannelViewContent.vue'
import ClipsViewContent from '/@/components/Main/MainView/ClipsViewContent/ClipsViewContent.vue'
import NullView from '/@/components/Main/MainView/NullView/NullView.vue'
import { ViewInformation } from '/@/store/ui/mainView'

defineProps<{
  viewInfo: ViewInformation
}>()
</script>
