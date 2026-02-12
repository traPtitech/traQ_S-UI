<template>
  <div :class="$style.container">
    <MarkdownPreview :content="topic" :title="topic" inline />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelsMap } = useChannelsStore()
const topic = computed(
  () => channelsMap.value.get(props.channelId)?.topic ?? ''
)
</script>

<style lang="scss" module>
.container {
  @include size-body2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-left: 40px;
  margin-right: 8px;
  margin-bottom: 4px;
  opacity: 0.8;
  cursor: pointer;
}
</style>
