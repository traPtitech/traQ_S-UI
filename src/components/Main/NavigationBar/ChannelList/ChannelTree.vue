<template>
  <div>
    <channel-element
      v-for="channel in channels"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      :is-opened="childrenShownChannels.has(channel.id)"
      :show-shortened-path="showShortenedPath"
      @channel-select="onChannelSelect"
      @channel-folding-toggle="toggleChildren"
    >
      <slide-down :is-open="childrenShownChannels.has(channel.id)">
        <channel-tree :class="$style.children" :channels="channel.children" />
      </slide-down>
    </channel-element>
  </div>
</template>

<script lang="ts" setup>
import { ChannelId } from '/@/types/entity-ids'
import { ChannelTreeNode } from '/@/lib/channelTree'
import { useOpenLink } from '/@/composables/useOpenLink'
import useChannelPath from '/@/composables/useChannelPath'
import ChannelElement from './ChannelElement.vue'
import SlideDown from '/@/components/UI/SlideDown.vue'
import { ref } from 'vue'

withDefaults(
  defineProps<{
    channels: ReadonlyArray<ChannelTreeNode>
    showShortenedPath?: boolean
  }>(),
  {
    showShortenedPath: false
  }
)

const childrenShownChannels = ref(new Set<ChannelId>())
const toggleChildren = (channelId: ChannelId) => {
  if (childrenShownChannels.value.has(channelId)) {
    childrenShownChannels.value.delete(channelId)
  } else {
    childrenShownChannels.value.add(channelId)
  }
}

const { openLink } = useOpenLink()
const { channelIdToLink } = useChannelPath()
const onChannelSelect = (event: MouseEvent, channelId: ChannelId) => {
  openLink(event, channelIdToLink(channelId))
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
