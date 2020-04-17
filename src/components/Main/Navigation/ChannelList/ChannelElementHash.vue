<template>
  <div :class="$style.container">
    <div :class="$style.hash" :style="styles.hash">
      <icon name="hash" :class="$style.icon" />
    </div>
    <div v-if="hasNotification" :class="$style.indicator">
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
import { makeStyles } from '@/lib/styles'
import Icon from '@/components/UI/Icon.vue'
import NotificationIndicator from '@/components/UI/NotificationIndiator.vue'

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
    /** 子チャンネルを持っているか */
    hasChild: {
      type: Boolean,
      default: false
    },
    /** 現在表示中のチャンネルか */
    isSelected: {
      type: Boolean,
      default: false
    },
    /**
     * チャンネルリストでアクティブ表示か
     * e.g. ホームの非購読チャンネルはアクティブでない
     */
    isActive: {
      type: Boolean,
      default: false
    },
    /** 子チャンネルを展開表示しているか */
    isOpened: {
      type: Boolean,
      default: false
    },
    /** 自分自身に通知があるか */
    hasNotification: {
      type: Boolean,
      default: false
    },
    /** 子チャンネルに通知があるか */
    hasNotificationOnChild: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context: SetupContext) {
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
    return { styles }
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
  border: solid 2px transparent;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  box-sizing: content-box;
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
