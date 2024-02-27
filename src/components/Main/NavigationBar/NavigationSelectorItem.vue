<template>
  <button
    :class="$style.container"
    :style="containerStyle"
    :aria-selected="isSelected"
    role="tab"
  >
    <a-icon :class="$style.icon" :name="iconName" :mdi="iconMdi" :size="24" />
    <div v-if="hasNotification" :class="$style.indicator">
      <notification-indicator :size="6" />
    </div>
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { ThemeClaim } from '/@/lib/styles'
import { commonStyles } from '/@/lib/styles'
import { useThemeSettings } from '/@/store/app/themeSettings'
import AIcon from '/@/components/UI/AIcon.vue'
import NotificationIndicator from '/@/components/UI/NotificationIndicator.vue'

const props = withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
    isSelected?: boolean
    hasNotification?: boolean
    colorClaim?: ThemeClaim<string>
  }>(),
  {
    iconMdi: false,
    isSelected: false,
    hasNotification: false
  }
)

const { currentTheme } = useThemeSettings()
const containerStyle = computed(() => ({
  color: props.colorClaim?.(currentTheme.value, commonStyles)
}))
</script>

<style lang="scss" module>
.container {
  @include color-accent-primary;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 100vw;
  cursor: pointer;
  &::after {
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: 100vw;
    background: currentColor;
    opacity: 0;
  }
  &[aria-selected='true']::after,
  &:hover::after,
  &:focus::after {
    opacity: 0.1;
  }
}
.icon {
  width: 24px;
  height: 24px;
  opacity: 0.3;
  &:hover {
    opacity: 0.7;
  }
  .container[aria-selected='true'] & {
    opacity: 1;
  }
}
.indicator {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
