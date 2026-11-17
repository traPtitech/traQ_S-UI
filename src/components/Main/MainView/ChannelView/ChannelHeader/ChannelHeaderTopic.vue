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
  flex: none;
  width: max-content;
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
  font-weight: normal;
  white-space: nowrap;
}
</style>
