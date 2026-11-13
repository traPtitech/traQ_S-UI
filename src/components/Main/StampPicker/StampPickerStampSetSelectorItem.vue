<template>
  <button
    type="button"
    :class="$style.container"
    :aria-pressed="isActive"
    :aria-label="stampSet.label"
    :title="stampSet.label"
  >
    <span v-if="isActive" :class="$style.indicator" />
    <StampSetIcon
      :stamp-set="stampSet"
      :class="stampSet.type === 'palette' ? $style.paletteStamp : $style.icon"
      aria-hidden="true"
    />
  </button>
</template>

<script lang="ts" setup>
import StampSetIcon from '/@/components/UI/StampSetIcon.vue'
import type { StampPickerTab } from '/@/store/ui/stampPickerSettings'

withDefaults(
  defineProps<{
    stampSet: StampPickerTab
    isActive?: boolean
  }>(),
  {
    isActive: false
  }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 36px;
  cursor: pointer;
  &[aria-pressed='true'] {
    @include color-accent-primary;
  }

  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
    outline-offset: -2px;
  }
}
.indicator {
  @include background-accent-primary;
  position: absolute;
  height: 2px;
  bottom: 0;
  inset-inline: 0;
}
.paletteStamp {
  opacity: 0.5;
  filter: grayscale(1);
  .container[aria-pressed='true'] & {
    opacity: 1;
    filter: initial;
  }
  .container:hover & {
    opacity: 1;
  }
}
.icon {
  opacity: 0.5;
  .container[aria-pressed='true'] &,
  .container:hover & {
    opacity: 1;
  }
}
</style>
