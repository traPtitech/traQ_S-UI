<template>
  <div>
    <ChannelElement
      v-for="channelOrClipFolder in channelTreeNodes"
      :key="channelOrClipFolder.id"
      :class="$style.element"
      :channel-or-clip-folder="channelOrClipFolder"
      show-shortened-path
      :show-star="props.showStar"
      :show-notified="props.showNotified"
    >
      <ChannelElementTopic
        v-if="showTopic"
        :class="$style.topic"
        :channel-id="channelOrClipFolder.id"
      />
    </ChannelElement>
  </div>
</template>

<script lang="ts" setup>
import type { Channel, ClipFolder } from '@traptitech/traq'

import { type DeepReadonly, computed } from 'vue'

import type {
  ChannelTreeNode,
  ClipFolderTreeNode,
  TreeNode
} from '/@/lib/channelTree'

import ChannelElement from './ChannelElement.vue'
import ChannelElementTopic from './ChannelElementTopic.vue'

type Item = Channel | ClipFolder

const props = withDefaults(
  defineProps<{
    channelsOrClipFolders: DeepReadonly<Item[]>
    showTopic?: boolean
    showStar?: boolean
    showNotified?: boolean
    isClip?: boolean
  }>(),
  {
    showTopic: false,
    showStar: false,
    isClip: false
  }
)

const channelTreeNodes = computed((): TreeNode[] =>
  props.channelsOrClipFolders.map(channelOrClipFolder => {
    if (props.isClip) {
      return {
        id: channelOrClipFolder.id,
        name: channelOrClipFolder.name,
        children: [],
        active: true,
        archived: false,
        type: 'clip-folder'
      } as ClipFolderTreeNode
    }
    return {
      id: channelOrClipFolder.id,
      name: channelOrClipFolder.name,
      children: [],
      active: true,
      archived: 'archived' in channelOrClipFolder ? channelOrClipFolder.archived : false,
      type: 'channel'
    } as ChannelTreeNode
  })
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
