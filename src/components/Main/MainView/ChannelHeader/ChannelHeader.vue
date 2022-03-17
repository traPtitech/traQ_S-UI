<template>
  <main-view-header>
    <template #header>
      <div :class="$style.header">
        <channel-header-channel-name :channel-id="channelId" />
        <channel-header-topic :class="$style.topic" :channel-id="channelId" />
      </div>
    </template>
    <template #tools>
      <channel-header-tools :channel-id="channelId" />
    </template>
  </main-view-header>
</template>

<script lang="ts" setup>
import MainViewHeader from '/@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import ChannelHeaderChannelName from './ChannelHeaderChannelName.vue'
import ChannelHeaderTopic from './ChannelHeaderTopic.vue'
import ChannelHeaderTools from './ChannelHeaderTools.vue'
import { ChannelId } from '/@/types/entity-ids'

defineProps<{
  channelId: ChannelId
}>()
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  overflow-x: auto;
}
.topic {
  margin-left: 16px;
  [data-is-mobile] & {
    margin-left: 12px;
  }
}
.headerContainer {
  display: flex;
}
.navigationButton {
  display: flex;
  align-items: center;
  margin-right: 8px;
}
</style>
