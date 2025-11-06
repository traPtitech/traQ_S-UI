<template>
  <SidebarEventFrame
    title="トピック変更"
    icon-name="format-title"
    icon-mdi
    :user-id="details.userId"
    :datetime="datetime"
  >
    <div :class="$style.newTopic" :data-is-empty="details.after === ''">
      <MarkdownPreview
        :content="details.after !== '' ? details.after : '未設定'"
        accept-action
        inline
      />
    </div>
  </SidebarEventFrame>
</template>

<script lang="ts" setup>
import type { TopicChangedEvent } from '@traptitech/traq'

import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'

import SidebarEventFrame from './SidebarEventFrame.vue'

defineProps<{
  datetime: string
  details: TopicChangedEvent
}>()
</script>

<style lang="scss" module>
.newTopic {
  &[data-is-empty='true'] {
    @include color-ui-primary-inactive;
  }
}
</style>
