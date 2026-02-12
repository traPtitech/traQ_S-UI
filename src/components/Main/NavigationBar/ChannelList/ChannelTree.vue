<template>
  <div>
    <ChannelElement
      v-for="channel in channels"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      :is-opened="childrenShownChannels.has(channel.id)"
      :show-shortened-path="showShortenedPath"
      :show-topic="showTopic"
      @click-hash="toggleChildren"
    >
      <SlideDown :is-open="childrenShownChannels.has(channel.id)">
        <channel-tree
          :class="$style.children"
          :channels="channel.children"
          :show-topic="showTopic"
        />
      </SlideDown>
    </ChannelElement>
  </div>
</template>

<script lang="ts" setup>
import { type HTMLAttributes, ref } from 'vue'

import SlideDown from '/@/components/UI/SlideDown.vue'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import type { ChannelId } from '/@/types/entity-ids'

import ChannelElement from './ChannelElement.vue'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  channels: ReadonlyArray<ChannelTreeNode>
  showShortenedPath?: boolean
  showTopic?: boolean
}

withDefaults(defineProps<Props>(), {
  showShortenedPath: false,
  showTopic: false
})

const childrenShownChannels = ref(new Set<ChannelId>())
const toggleChildren = (channelId: ChannelId) => {
  if (childrenShownChannels.value.has(channelId)) {
    childrenShownChannels.value.delete(channelId)
  } else {
    childrenShownChannels.value.add(channelId)
  }
}
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}

.children {
  margin-left: 12px;
}
</style>