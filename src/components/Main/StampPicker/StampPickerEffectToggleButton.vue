<template>
  <button
    :class="$style.container"
    :aria-selected="isActive"
    :data-has-effect="hasEffect"
  >
    <a-icon name="effect" />
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

withDefaults(
  defineProps<{
    isActive?: boolean
    hasEffect?: boolean
  }>(),
  {
    isActive: false,
    hasEffect: false
  }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary-inactive;
  @include background-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border: {
    radius: 4px;
    width: 2px;
    style: solid;
    color: transparent;
  }
  cursor: pointer;

  &[aria-selected='true'] {
    @include color-accent-primary;
    border-color: $theme-accent-primary-default;
  }
  &[data-has-effect='true'] {
    @include color-accent-primary;
  }
}
</style>
