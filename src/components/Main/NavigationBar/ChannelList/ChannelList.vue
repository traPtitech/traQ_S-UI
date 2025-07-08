<template>
  <div>
    <channel-element
      v-for="channel in channelTreeNodes"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      show-shortened-path
      :show-star="props.showStar"
      :show-notified="props.showNotified"
    >
      <channel-element-topic
        v-if="showTopic"
        :class="$style.topic"
        :channel-id="channel.id"
      />
    </channel-element>
  </div>
</template>

<script lang="ts" setup>
import type { ChannelTreeNode } from '/@/lib/channelTree'
import type { Channel } from '@traptitech/traq'
import ChannelElementTopic from './ChannelElementTopic.vue'
import ChannelElement from './ChannelElement.vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    channels: ReadonlyArray<Channel>
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
