<template>
  <div>
    <channel-element
      v-for="channel in channelTreeNodes"
      :key="channel.id"
      :class="$style.element"
      :channel="channel"
      show-shortened-path
      @channel-select="onChannelSelect"
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
import { ChannelId } from '/@/types/entity-ids'
import { ChannelTreeNode } from '/@/lib/channelTree'
import { Channel } from '@traptitech/traq'
import { useOpenLink } from '/@/composables/useOpenLink'
import useChannelPath from '/@/composables/useChannelPath'
import ChannelElementTopic from './ChannelElementTopic.vue'
import ChannelElement from './ChannelElement.vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    channels: ReadonlyArray<Channel>
    showTopic?: boolean
  }>(),
  {
    showTopic: false
  }
)

const channelTreeNodes = computed((): ChannelTreeNode[] =>
  props.channels.map(channel => ({ ...channel, children: [], active: true }))
)

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

.topic {
  margin-left: 40px;
  margin-right: 8px;
}
</style>
