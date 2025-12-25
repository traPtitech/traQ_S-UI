<template>
  <div v-if="topic" :class="$style.container">
    <MarkdownPreview
      :class="$style.topic"
      :content="topic"
      :title="topic"
      accept-action
      inline
    />
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
const topic = computed(() => channelsMap.value.get(props.channelId)?.topic)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  height: 16px;
  padding: 0 16px;
  border-left: {
    style: solid;
    width: 2px;
    color: $theme-ui-tertiary-default;
  }
  [data-is-mobile] & {
    padding-left: 12px;
    padding-right: 4px;
  }
}
.topic {
  @include size-body2;
  width: 100%;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
