<template>
  <div :class="$style.container" :aria-selected="isSelected">
    <icon :class="$style.icon" :name="iconName" />
    <span :class="$style.title">{{ title }}</span>
    <span :class="$style.description">{{ description }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import Icon from '/@/components/UI/Icon.vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'

const titleMap: Record<ChannelSubscribeLevel, string> = {
  [ChannelSubscribeLevel.notified]: '通知オン',
  [ChannelSubscribeLevel.subscribed]: '未読のみ管理',
  [ChannelSubscribeLevel.none]: 'なし'
}
const descriptionMap: Record<ChannelSubscribeLevel, string> = {
  [ChannelSubscribeLevel.notified]: '新規メッセージの通知を送信します',
  [ChannelSubscribeLevel.subscribed]:
    '新規メッセージの有無をチャンネルリストに表示し、通知は送信しません',
  [ChannelSubscribeLevel.none]: '未読の管理・通知を行いません'
}
const iconNameMap: Record<ChannelSubscribeLevel, string> = {
  [ChannelSubscribeLevel.notified]: 'notified',
  [ChannelSubscribeLevel.subscribed]: 'subscribed',
  [ChannelSubscribeLevel.none]: 'not-subscribed'
}

export default defineComponent({
  name: 'NotificationSelectorItem',
  components: {
    Icon
  },
  props: {
    subscriptionLevel: {
      type: Number as PropType<ChannelSubscribeLevel>,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const iconName = computed(() => iconNameMap[props.subscriptionLevel])
    const title = computed(() => titleMap[props.subscriptionLevel])
    const description = computed(() => descriptionMap[props.subscriptionLevel])
    return { iconName, title, description }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: grid;
  grid-template:
    'icon title' 24px
    '.... description' 1fr /
    24px 1fr;
  column-gap: 16px;
  width: 100%;
  user-select: none;
  cursor: pointer;
  opacity: 0.5;

  &[aria-selected='true'] {
    color: $theme-accent-primary;
    opacity: 1;
  }
}
.icon {
  @include size-body1;
  grid-area: icon;
}
.title {
  font: {
    size: 1rem;
    weight: bold;
  }
  grid-area: title;
}
.description {
  @include color-ui-primary;
  @include size-caption;
  grid-area: description;
}
</style>
