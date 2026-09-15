<template>
  <button
    :class="$style.container"
    :disabled="props.isPosting"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <CircleIcon
      mdi
      name="close"
      :size="16"
      :color="iconColor"
      :background="iconBackgroundColor"
    />
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import CircleIcon from '/@/components/UI/CircleIcon.vue'
import useHover from '/@/composables/dom/useHover'
import { useThemeSettings } from '/@/store/app/themeSettings'

const props = withDefaults(
  defineProps<{
    isPosting?: boolean
  }>(),
  {
    isPosting: false
  }
)

const { currentTheme } = useThemeSettings()
const { isHovered, onMouseEnter, onMouseLeave } = useHover()

const iconBackgroundColorNotHovered = computed(
  () => currentTheme.value.basic.ui.primary.inactive
)
const iconBackgroundColorHovered = computed(
  () => currentTheme.value.basic.ui.primary.default
)

const iconBackgroundColor = computed(() =>
  isHovered.value
    ? iconBackgroundColorHovered.value
    : iconBackgroundColorNotHovered.value
)
const iconColor = computed(
  () => currentTheme.value.basic.background.primary.border
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: $z-index-message-input-file-close-button;
  &[disabled] {
    @include color-ui-secondary-inactive;
    cursor: not-allowed;
  }
}
</style>
