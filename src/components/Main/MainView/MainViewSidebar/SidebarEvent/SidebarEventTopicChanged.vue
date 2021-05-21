<template>
  <sidebar-event-frame
    title="トピック変更"
    icon-name="format-title"
    icon-mdi
    show-chevron
  >
    <div :class="$style.newTopic" :data-is-empty="details.after === ''">
      <inline-markdown
        :content="details.after !== '' ? details.after : '未設定'"
      />
    </div>
    <div :class="$style.user">
      <div :class="$style.bar" />
      <user-icon :user-id="details.userId" :size="20" />
      <div :class="$style.displayName">{{ userDisplayName }}</div>
    </div>
  </sidebar-event-frame>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { TopicChangedEvent } from '@traptitech/traq'
import SidebarEventFrame from './SidebarEventFrame.vue'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import InlineMarkdown from '@/components/UI/InlineMarkdown.vue'

export default defineComponent({
  name: 'SidebarEventTopicChanged',
  components: {
    SidebarEventFrame,
    InlineMarkdown,
    UserIcon
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
  },
  setup(props) {
    const userDisplayName = computed(
      () =>
        store.state.entities.usersMap.get(props.details.userId)?.displayName ??
        'unknown'
    )
    return { userDisplayName }
  }
})
</script>

<style lang="scss" module>
.newTopic {
  @include color-ui-primary;
  &[data-is-empty='true'] {
    opacity: 0.5;
  }
}

.user {
  display: flex;
  align-items: center;
}
.bar {
  @include background-secondary;
  width: 16px;
  height: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}
.displayName {
  flex: 1;
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
