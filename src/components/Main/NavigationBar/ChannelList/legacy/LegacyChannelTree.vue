<template>
  <div>
    <div v-for="channel in channels" :key="channel.id">
      <ChannelElement
        :channel="channel"
        :depth="depth"
        :is-opened="expandedChannels.has(channel.id)"
        :show-shortened-path="showShortenedPath"
        :show-topic="showTopic"
        :show-star="showStar"
        :show-notified="showNotified"
        @click-hash="toggleChildren"
      />
      <SlideDown
        v-if="channel.children.length > 0"
        :is-open="expandedChannels.has(channel.id)"
      >
        <LegacyChannelTree
          :channels="channel.children"
          :depth="depth + 1"
          :show-topic="showTopic && showChildTopic"
          :show-star="showStar"
          :show-notified="showNotified"
        />
      </SlideDown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

import SlideDown from '/@/components/UI/SlideDown.vue'
import type { ChannelId } from '/@/types/entity-ids'

import ChannelElement from '../ChannelElement.vue'
import type { ChannelTreeProps } from '../channelTreeProps'

interface LegacyChannelTreeProps extends ChannelTreeProps {
  depth?: number
}

const { depth = 0, showChildTopic = true } =
  defineProps<LegacyChannelTreeProps>()

const expandedChannels = reactive(new Set<ChannelId>())

const toggleChildren = (channelId: ChannelId) => {
  if (expandedChannels.has(channelId)) {
    expandedChannels.delete(channelId)
  } else {
    expandedChannels.add(channelId)
  }
}
</script>
