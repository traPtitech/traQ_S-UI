<template>
  <primary-view-header>
    <template #header>
      <div :class="$style.header">
        <channel-header-channel-name :channel-id="channelId" />
        <channel-header-relation-button
          :key="channelId"
          :channel-id="channelId"
        />
        <channel-header-topic :class="$style.topic" :channel-id="channelId" />
      </div>
    </template>
    <template #tools>
      <channel-header-tools :channel-id="channelId" />
    </template>
  </primary-view-header>
</template>

<script lang="ts" setup>
import PrimaryViewHeader from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeader.vue'
import ChannelHeaderChannelName from './ChannelHeaderChannelName.vue'
import ChannelHeaderRelationButton from './ChannelHeaderRelationButton.vue'
import ChannelHeaderTopic from './ChannelHeaderTopic.vue'
import ChannelHeaderTools from './ChannelHeaderTools.vue'
import type { ChannelId } from '/@/types/entity-ids'

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
  overflow-x: scroll;
  margin-bottom: -6px;
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
