<template>
  <sidebar-event-frame
    title="トピック変更"
    icon-name="format-title"
    icon-mdi
    :user-id="details.userId"
    :datetime="datetime"
  >
    <div :class="$style.newTopic" :data-is-empty="details.after === ''">
      <markdown-preview
        :content="details.after !== '' ? details.after : '未設定'"
        accept-action
        inline
      />
    </div>
  </sidebar-event-frame>
</template>

<script lang="ts" setup>
import SidebarEventFrame from './SidebarEventFrame.vue'
import MarkdownPreview from '/@/components/UI/MarkdownPreview.vue'
import type { TopicChangedEvent } from '@traptitech/traq'

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
