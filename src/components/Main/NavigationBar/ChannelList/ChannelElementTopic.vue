<template>
  <div :class="$style.container">
    <markdown-preview :content="topic" :title="topic" inline />
  </div>
</template>

<script lang="ts" setup>
import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'
import { computed } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import { useChannelsStore } from '/@/store/entities/channels'

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

  cursor: pointer;
}
</style>
