<template>
  <div>
    <channel-element
      v-for="channel in channels"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      :is-opened="childrenShownChannels.has(channel.id)"
      :show-shortened-path="showShortenedPath"
      @click-hash="toggleChildren"
    >
      <slide-down :is-open="childrenShownChannels.has(channel.id)">
        <channel-tree :class="$style.children" :channels="channel.children" />
      </slide-down>
    </channel-element>
  </div>
</template>

<script lang="ts" setup>
import type { ChannelId } from '/@/types/entity-ids'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import ChannelElement from './ChannelElement.vue'
import SlideDown from '/@/components/UI/SlideDown.vue'
import { ref, type HTMLAttributes } from 'vue'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  channels: ReadonlyArray<ChannelTreeNode>
  showShortenedPath?: boolean
}

withDefaults(defineProps<Props>(), {
  showShortenedPath: false
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
