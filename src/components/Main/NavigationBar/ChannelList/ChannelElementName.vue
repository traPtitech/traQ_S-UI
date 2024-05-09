<template>
  <div :class="$style.container" :data-is-selected="$boolAttr(isSelected)">
    <span :class="$style.name" :title="pathTooltip">
      {{ pathToShow }}
    </span>
    <template v-if="qallUserIds.length > 0">
      <a-icon :class="$style.qallIcon" :size="16" mdi name="phone-outline" />
      <user-icon-ellipsis-list
        :class="$style.qallUserList"
        direction="row"
        transition="fade-right"
        :user-ids="qallUserIds"
        :border-width="2"
        :icon-size="24"
        :overlap="12"
        prevent-modal
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import UserIconEllipsisList from '/@/components/UI/UserIconEllipsisList.vue'
import type { ChannelTreeNode } from '/@/lib/channelTree'
import type { Channel } from '@traptitech/traq'
import type { TypedProps } from './composables/usePath'
import { usePath, useRTCState } from './composables/usePath'

const props = withDefaults(
  defineProps<{
    channel: ChannelTreeNode | Channel
    showShortenedPath: boolean
    isSelected?: boolean
  }>(),
  {
    isSelected: false
  }
)

const typedProps = props as TypedProps

const { pathToShow, pathTooltip } = usePath(typedProps)
const { qallUserIds } = useRTCState(typedProps)
</script>

<style lang="scss" module>
.container {
  @include size-body1;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 8px;
  cursor: pointer;
  &[data-is-selected] {
    font-weight: bold;
  }
}
.name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qallIcon {
  flex-shrink: 0;
  margin: 2px 4px;
  opacity: 0.5;
}
.qallUserList {
  @include size-caption;
}
</style>
