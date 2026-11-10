<template>
  <PrimaryViewHeader>
    <template #header>
      <div :class="$style.header">
        <ChannelHeaderChannelName :channel-id="channelId" />
      </div>
    </template>
    <template #tools>
      <ThreadHeaderTools @click-more="emit('clickMore')" />
    </template>
  </PrimaryViewHeader>
</template>

<script lang="ts" setup>
import ChannelHeaderChannelName from '/@/components/Main/MainView/ChannelView/ChannelHeader/ChannelHeaderChannelName.vue'
import PrimaryViewHeader from '/@/components/Main/MainView/PrimaryViewHeader/PrimaryViewHeader.vue'
import type { ChannelId } from '/@/types/entity-ids'

import ThreadHeaderTools from './ThreadHeaderTools.vue'

defineProps<{
  channelId: ChannelId
}>()

const emit = defineEmits<{
  (e: 'clickMore'): void
}>()
</script>

<style lang="scss" module>
.header {
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  margin-bottom: -6px;
  white-space: nowrap;

  > * {
    flex-shrink: 0;
  }
}
</style>
