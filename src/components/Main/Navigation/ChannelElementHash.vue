<template>
  <div :class="$style.container">
    <div :class="$style.hash" :style="styles.hash">
      <icon name="hash" />
    </div>
    <div v-if="props.hasNotification" :class="$style.indicator">
      <notification-indicator has-border />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  computed
} from '@vue/composition-api'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import NotificationIndicator from '@/components/UI/NotificationIndiator.vue'

type Props = {
  /** 子チャンネルを持っているか */
  hasChild: boolean

  /** 現在表示中のチャンネルか */
  isSelected: boolean

  /**
   * チャンネルリストでアクティブ表示か
   * e.g. ホームの非購読チャンネルはアクティブでない
   */
  isActive: boolean

  /** 子チャンネルを展開表示しているか */
  isOpened: boolean

  /** 自分自身に通知があるか */
  hasNotification: boolean

  /** 子チャンネルに通知があるか */
  hasNotificationOnChild: boolean
}

const useLeafContainerStyle = (selected: boolean) =>
  makeStyles(theme => ({
    color: selected ? theme.accent.primary : theme.ui.primary
  }))

const useClosedParentContainerStyle = (
  selected: boolean,
  hasNotificationOnChild: boolean
) =>
  makeStyles(theme => ({
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: selected
      ? theme.accent.primary
      : hasNotificationOnChild
      ? theme.accent.notification
      : theme.ui.primary,
    color: selected ? theme.accent.primary : theme.ui.primary
  }))

const useOpenedParentContainerStyle = (selected: boolean) =>
  makeStyles(theme => ({
    background: selected ? theme.accent.primary : theme.ui.primary,
    color: theme.background.secondary
  }))

export default defineComponent({
  name: 'ChannelElementHash',
  components: {
    Icon,
    NotificationIndicator
  },
  props: {
    hasChild: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isOpened: {
      type: Boolean,
      default: false
    },
    hasNotification: {
      type: Boolean,
      default: false
    },
    hasNotificationOnChild: {
      type: Boolean,
      default: false
    }
  },
  setup(props: Props, context: SetupContext) {
    const styles = reactive({
      hash: computed(() =>
        !props.hasChild
          ? useLeafContainerStyle(props.isSelected).value
          : props.isOpened
          ? useOpenedParentContainerStyle(props.isSelected).value
          : useClosedParentContainerStyle(
              props.isSelected,
              props.hasNotificationOnChild
            ).value
      ),
      indicator: makeStyles(theme => ({
        backgroundColor: theme.accent.notification
      }))
    })
    return { props, styles }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 32px;
  height: 32px;
}
.hash {
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
}
.inactive {
  opacity: 0.5;
}
.indicator {
  position: absolute;
  top: 1px;
  right: 1px;
}
</style>
