<template>
  <sidebar-event-frame
    title="トピック変更"
    icon-name="format-title"
    icon-mdi
    :user-id="details.userId"
    :datetime="datetime"
  >
    <div :class="$style.newTopic" :data-is-empty="details.after === ''">
      <inline-markdown
        :content="details.after !== '' ? details.after : '未設定'"
      />
    </div>
  </sidebar-event-frame>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TopicChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import InlineMarkdown from '/@/components/UI/InlineMarkdown.vue'

export default defineComponent({
  name: 'SidebarEventTopicChanged',
  components: {
    SidebarEventFrame,
    InlineMarkdown
  },
  props: {
    datetime: {
      type: String,
      required: true
    },
    details: {
      type: Object as PropType<TopicChangedEvent>,
      required: true
    }
  }
})
</script>

<style lang="scss" module>
.newTopic {
  &[data-is-empty='true'] {
    opacity: 0.5;
  }
}
</style>
