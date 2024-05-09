<template>
  <component
    :is="hasChild ? 'button' : 'div'"
    :class="$style.container"
    :aria-label="
      hasChild && !isOpened
        ? 'チャンネルツリーを展開'
        : hasChild && isOpened
        ? 'チャンネルツリーを閉じる'
        : undefined
    "
  >
    <div
      :class="$style.hash"
      :data-container-type="hasChild ? 'parent' : 'leaf'"
      :data-is-opened="$boolAttr(hasChild && isOpened)"
      :data-is-selected="$boolAttr(isSelected)"
      :data-has-notification-on-child="$boolAttr(hasNotificationOnChild)"
      :data-is-inactive="$boolAttr(isInactive)"
    >
      <a-icon name="hash" :class="$style.icon" />
    </div>
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator :border-width="2" />
    </div>
  </component>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'

withDefaults(
  defineProps<{
    hasChild?: boolean
    isSelected?: boolean
    isInactive?: boolean
    isOpened?: boolean
    hasNotification?: boolean
    hasNotificationOnChild?: boolean
  }>(),
  {
    hasChild: false,
    isSelected: false,
    isInactive: false,
    isOpened: false,
    hasNotification: false,
    hasNotificationOnChild: false
  }
)
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
      border-color: $theme-ui-secondary-default;
    }
    &[data-is-selected] {
      @include color-accent-primary;
    }
  }
  &[data-container-type='parent'] {
    &:hover::before,
    .container:focus &::before {
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
      color: var(--specific-channel-hash-opened);
      background: $theme-ui-primary-background;
      &:hover::before,
      .container:focus &::before {
        background: $theme-ui-primary-background;
        opacity: 0.5;
      }
      &[data-is-inactive] {
        background: $theme-ui-secondary-background;
        &:hover::before,
        .container:focus &::before {
          background: $theme-ui-secondary-background;
        }
      }
      &[data-is-selected] {
        @include background-accent-primary;
        &:hover::before,
        .container:focus &::before {
          @include background-accent-primary;
        }
      }
    }
    &:not([data-is-opened]) {
      @include color-ui-primary;
      border-color: $theme-ui-primary-default;
      &:hover::before,
      .container:focus &::before {
        background: $theme-ui-primary-background;
        opacity: 0.2;
      }
      &[data-is-inactive] {
        @include color-ui-secondary;
        border-color: $theme-ui-secondary-default;
        &:hover::before,
        .container:focus &::before {
          background: $theme-ui-secondary-background;
        }
      }
      &[data-has-notification-on-child] {
        border-color: $theme-accent-notification-default;
        &:hover::before,
        .container:focus &::before {
          background: $theme-accent-notification-background;
        }
      }
      &[data-is-selected] {
        @include color-accent-primary;
        border-color: $theme-accent-primary-default;
        &:hover::before,
        .container:focus &::before {
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
