<template>
  <ChannelTree
    v-if="featureFlags.channel_virtual_scroll.enabled"
    v-bind="treeProps"
    :show-child-topic="showChildTopic"
    :scroll-element="scrollElement"
    :scroll-margin="scrollMargin"
  />
  <LegacyChannelTree
    v-else
    v-bind="treeProps"
    :show-child-topic="showChildTopic"
  />
</template>

<script lang="ts" setup>
import { useFeatureFlagSettings } from '/@/store/app/featureFlagSettings'

import ChannelTree from './ChannelTree.vue'
import type { VirtualChannelTreeProps } from './channelTreeProps'
import LegacyChannelTree from './legacy/LegacyChannelTree.vue'

const {
  scrollElement,
  scrollMargin,
  showChildTopic = true,
  ...treeProps
} = defineProps<VirtualChannelTreeProps>()

const { featureFlags } = useFeatureFlagSettings()
</script>
