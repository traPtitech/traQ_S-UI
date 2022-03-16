<template>
  <button
    :class="$style.container"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <circle-icon
      mdi
      name="close"
      :size="16"
      :color="iconColor"
      :background="iconBackgroundColor"
    />
  </button>
</template>

<script lang="ts" setup>
import CircleIcon from '/@/components/UI/CircleIcon.vue';
import { computed } from 'vue';
import useHover from '/@/composables/useHover'
import { useThemeSettings } from '/@/store/app/themeSettings'

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
}
</style>
