<template>
  <div>
    <ChannelElement
      v-for="channel in channelTreeNodes"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      show-shortened-path
      :show-star="props.showStar"
      :show-notified="props.showNotified"
    >
      <ChannelElementTopic
        v-if="showTopic"
        :class="$style.topic"
        :channel-id="channel.id"
      />
    </ChannelElement>
  </div>
</template>

<script lang="ts" setup>
import type { Channel } from '@traptitech/traq'

import { type DeepReadonly, computed } from 'vue'

import type { ChannelTreeNode } from '/@/lib/channelTree'

import ChannelElement from './ChannelElement.vue'
import ChannelElementTopic from './ChannelElementTopic.vue'

const props = withDefaults(
  defineProps<{
    channels: DeepReadonly<Channel[]>
    showTopic?: boolean
    showStar?: boolean
    showNotified?: boolean
  }>(),
  {
    showTopic: false,
    showStar: false
  }
)

const channelTreeNodes = computed((): ChannelTreeNode[] =>
  props.channels.map(channel => ({ ...channel, children: [], active: true }))
)
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}

.topic {
  margin-left: 40px;
  margin-right: 8px;
}
</style>
