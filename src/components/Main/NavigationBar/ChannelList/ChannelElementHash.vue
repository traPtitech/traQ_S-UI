<template>
  <div :class="$style.container">
    <div
      :class="$style.hash"
      :data-container-type="hasChild ? 'parent' : 'leaf'"
      :data-is-opened="$boolAttr(hasChild && isOpened)"
      :aria-selected="isSelected"
      :data-has-notification-on-child="$boolAttr(hasNotificationOnChild)"
      :data-is-inactive="$boolAttr(isInactive)"
    >
      <a-icon name="hash" :class="$style.icon" />
    </div>
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator :border-width="2" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'

export default defineComponent({
  name: 'ChannelElementHash',
  components: {
    AIcon,
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
  position: relative;

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
    &:hover::before {
      content: '';
      border-radius: 4px;
      display: block;
      position: absolute;
      top: -4px;
      bottom: -4px;
      left: -4px;
      right: -4px;
    }
    &[data-is-opened] {
      color: $theme-background-secondary;
      background: $theme-ui-primary;
      &:hover::before {
        background: $theme-ui-primary;
        opacity: 0.5;
      }
      &[data-is-inactive] {
        background: $theme-ui-secondary;
        &:hover::before {
          background: $theme-ui-secondary;
        }
      }
      &[aria-selected='true'] {
        @include background-accent-primary;
        &:hover::before {
          @include background-accent-primary;
        }
      }
    }
    &:not([data-is-opened]) {
      @include color-ui-primary;
      border-color: $theme-ui-primary;
      &:hover::before {
        background: $theme-ui-primary;
        opacity: 0.2;
      }
      &[data-is-inactive] {
        @include color-ui-secondary;
        border-color: $theme-ui-secondary;
        &:hover::before {
          background: $theme-ui-secondary;
        }
      }
      &[data-has-notification-on-child] {
        border-color: $theme-accent-notification-default;
        &:hover::before {
          background: $theme-accent-notification-background;
        }
      }
      &[aria-selected='true'] {
        @include color-accent-primary;
        border-color: $theme-accent-primary-default;
        &:hover::before {
          @include background-accent-primary;
        }
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
