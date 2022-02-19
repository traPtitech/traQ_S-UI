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

<script lang="ts">
import { computed, defineComponent } from 'vue'
import CircleIcon from '/@/components/UI/CircleIcon.vue'
import store from '/@/store'
import useHover from '/@/use/hover'

export default defineComponent({
  name: 'MessageInputFileListItemCloseButton',
  components: {
    CircleIcon
  },
  setup() {
    const { isHovered, onMouseEnter, onMouseLeave } = useHover()

    const iconBackgroundColorNotHovered = computed(
      () =>
        store.getters.app.themeSettings.currentTheme.basic.ui.primary.inactive
    )
    const iconBackgroundColorHovered = computed(
      () =>
        store.getters.app.themeSettings.currentTheme.basic.ui.primary.default
    )

    const iconBackgroundColor = computed(() =>
      isHovered.value
        ? iconBackgroundColorHovered.value
        : iconBackgroundColorNotHovered.value
    )
    const iconColor = computed(
      () =>
        store.getters.app.themeSettings.currentTheme.basic.background.primary
          .border
    )

    return { onMouseEnter, onMouseLeave, iconBackgroundColor, iconColor }
  }
})
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
