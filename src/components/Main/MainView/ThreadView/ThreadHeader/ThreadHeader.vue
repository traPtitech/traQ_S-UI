<template>
  <PrimaryViewHeader>
    <template #header>
      <div :class="$style.header">
        <ChannelHeaderChannelName :channel-id="channelId" />
        <ChannelHeaderRelationButton :key="channelId" :channel-id="channelId" />
        <ChannelHeaderTopic :class="$style.topic" :channel-id="channelId" />
      </div>
    </template>
    <template #tools>
      <ChannelHeaderTools :channel-id="channelId" />
    </template>
  </PrimaryViewHeader>
</template>

<script lang="ts" setup>
import ChannelHeaderChannelName from '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeaderChannelName.vue'
import ChannelHeaderRelationButton from '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeaderRelationButton.vue'
import ChannelHeaderTools from '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeaderTools.vue'
import ChannelHeaderTopic from '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeaderTopic.vue'
import PrimaryViewHeader from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeader.vue'
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
  overflow-x: auto;
  overflow-y: hidden;
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
