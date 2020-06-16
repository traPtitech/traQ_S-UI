<template>
  <div :class="$style.container">
    <div
      :class="$style.hash"
      :data-container-type="hasChild ? 'parent' : 'leaf'"
      :data-is-opened="hasChild && isOpened"
      :aria-selected="isSelected ? 'true' : 'false'"
      :data-has-notification-on-child="hasNotificationOnChild"
      :data-is-inactive="isInactive"
    >
      <icon name="hash" :class="$style.icon" />
    </div>
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator has-border />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'
import NotificationIndicator from '@/components/UI/NotificationIndicator.vue'

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
     * チャンネルリストで非アクティブ表示か
     * e.g. ホームの非購読チャンネルはアクティブでない
     */
    isInactive: {
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
  setup() {
    return {}
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
  border: {
    width: 2px;
    style: solid;
    color: transparent;
  }
  border-radius: 4px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  box-sizing: content-box;
  cursor: pointer;

  &[data-container-type='leaf'] {
    @include color-ui-primary;
    &[data-is-inactive] {
      @include color-ui-secondary;
      border-color: $theme-ui-secondary;
    }
    &[aria-selected='true'] {
      @include color-accent-primary;
    }
  }
  &[data-container-type='parent'] {
    &[data-is-opened] {
      color: $theme-background-secondary;
      background: $theme-ui-primary;
      &[data-is-inactive] {
        background: $theme-ui-secondary;
      }
      &[aria-selected='true'] {
        @include background-accent-primary;
      }
    }
    &:not([data-is-opened]) {
      @include color-ui-primary;
      border-color: $theme-ui-primary;
      &[data-is-inactive] {
        @include color-ui-secondary;
        border-color: $theme-ui-secondary;
      }
      &[data-has-notification-on-child] {
        border-color: $theme-accent-notification;
      }
      &[aria-selected='true'] {
        @include color-accent-primary;
        border-color: $theme-accent-primary;
      }
      &:hover {
        background: $theme-background-primary;
      }
    }
  }
}
.indicator {
  position: absolute;
  top: 1px;
  right: 1px;
}
.icon {
  margin-left: 0.5px;
}
</style>
