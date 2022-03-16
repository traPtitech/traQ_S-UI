<template>
  <div :class="$style.container" :aria-selected="isSelected">
    <a-icon :class="$style.icon" :name="info.icon" />
    <span :class="$style.title">{{ info.title }}</span>
    <span :class="$style.description">{{ info.description }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ChannelSubscribeLevel } from '@traptitech/traq'
import AIcon from '/@/components/UI/AIcon.vue'

const props = withDefaults(
  defineProps<{
    subscriptionLevel: ChannelSubscribeLevel
    isSelected?: boolean
  }>(),
  {
    isSelected: false
  }
)

const subscribeLevelInfoMap: Record<
  ChannelSubscribeLevel,
  { title: string; description: string; icon: string }
> = {
  [ChannelSubscribeLevel.notified]: {
    title: '通知オン',
    description: '新規メッセージの通知を送信します',
    icon: 'notified'
  },
  [ChannelSubscribeLevel.subscribed]: {
    title: '未読のみ管理',
    description:
      '新規メッセージの有無をチャンネルリストに表示し、通知は送信しません',
    icon: 'subscribed'
  },
  [ChannelSubscribeLevel.none]: {
    title: 'なし',
    description: '未読の管理・通知を行いません',
    icon: 'not-subscribed'
  }
}

const info = computed(() => subscribeLevelInfoMap[props.subscriptionLevel])
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary-inactive;
  display: grid;
  grid-template:
    'icon title' 24px
    '.... description' 1fr /
    24px 1fr;
  column-gap: 16px;
  width: 100%;
  user-select: none;
  cursor: pointer;

  &:hover {
    @include color-ui-primary;
  }
  &[aria-selected='true'] {
    @include color-accent-primary;
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
