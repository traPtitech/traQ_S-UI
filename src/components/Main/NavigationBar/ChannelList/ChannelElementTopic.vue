<template>
  <div :class="$style.container">
    <inline-markdown :content="topic" :title="topic" />
  </div>
</template>

<script lang="ts" setup>
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue';
import { computed } from 'vue';
import { ChannelId } from '/@/types/entity-ids'
import { useChannelsStore } from '/@/store/entities/channels'

const props = defineProps<{
    channelId: ChannelId
}>();

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
