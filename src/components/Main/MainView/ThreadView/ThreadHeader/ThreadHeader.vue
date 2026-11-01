<template>
  <PrimaryViewHeader>
    <template #header>
      <div :class="$style.header">
        <ThreadHeaderThreadName :channel-id="channelId" />
        <ThreadHeaderRelationButton :key="channelId" :channel-id="channelId" />
        <ThreadHeaderTopic :class="$style.topic" :channel-id="channelId" />
      </div>
    </template>
    <template #tools>
      <ThreadHeaderTools :channel-id="channelId" />
    </template>
  </PrimaryViewHeader>
</template>

<script lang="ts" setup>
import PrimaryViewHeader from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeader.vue'
import type { ChannelId } from '/@/types/entity-ids'

import ThreadHeaderRelationButton from './ThreadHeaderRelationButton.vue'
import ThreadHeaderThreadName from './ThreadHeaderThreadName.vue'
import ThreadHeaderTools from './ThreadHeaderTools.vue'
import ThreadHeaderTopic from './ThreadHeaderTopic.vue'

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
