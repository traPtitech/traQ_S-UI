<template>
  <div v-if="topic" :class="$style.container">
    <template v-if="!isMobile">
      <inline-markdown
        :class="$style.topic"
        :content="topic"
        :title="topic"
        accept-action
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'
import { computed } from 'vue'
import type { ChannelId } from '/@/types/entity-ids'
import { useChannelsStore } from '/@/store/entities/channels'
import { useResponsiveStore } from '/@/store/ui/responsive'

const props = defineProps<{
  channelId: ChannelId
}>()

const { channelsMap } = useChannelsStore()
const topic = computed(() => channelsMap.value.get(props.channelId)?.topic)
const { isMobile } = useResponsiveStore()
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
