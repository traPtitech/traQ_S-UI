<template>
  <div :class="$style.container" :style="styles.container">
    <icon :class="$style.icon" :name="iconName" :mdi="iconMdi" />
    <span :class="$style.title">{{ title }}</span>
    <span :class="$style.description" :style="styles.description">{{
      description
    }}</span>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  computed
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
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
  [ChannelSubscribeLevel.none]: 'bell-outline'
}
const iconMdiMap: Record<ChannelSubscribeLevel, boolean> = {
  [ChannelSubscribeLevel.notified]: false,
  [ChannelSubscribeLevel.subscribed]: false,
  [ChannelSubscribeLevel.none]: true
}

const useStyles = (props: { isSelected: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      color: props.isSelected ? theme.accent.primary : theme.ui.primary,
      opacity: props.isSelected ? '1' : '0.5'
    })),
    description: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

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
    const styles = useStyles(props)
    const iconName = computed(() => iconNameMap[props.subscriptionLevel])
    const iconMdi = computed(() => iconMdiMap[props.subscriptionLevel])
    const title = computed(() => titleMap[props.subscriptionLevel])
    const description = computed(() => descriptionMap[props.subscriptionLevel])
    return { styles, iconName, iconMdi, title, description }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template:
    'icon title' 24px
    '.... description' 1fr /
    24px 1fr;
  column-gap: 16px;
  width: 100%;
  user-select: none;
  cursor: pointer;
}
.icon {
  font-size: 1rem;
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
  font-size: 0.75rem;
  grid-area: description;
}
</style>
