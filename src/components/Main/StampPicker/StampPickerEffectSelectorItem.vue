<template>
  <button
    :class="$style.container"
    :data-is-selected="isSelected"
    :data-is-disabled="isDisabled"
  >
    {{ name }}
  </button>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    name: string
    isSelected: boolean
    isInactive?: boolean
    isDisabled?: boolean
  }>(),
  {
    isInactive: false,
    isDisabled: false
  }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  @include background-primary;
  @include size-body2;
  padding: 0 4px;
  border: 2px solid $theme-background-secondary-border;
  border-radius: 13px;
  flex-grow: 1;
  flex-shrink: 0;
  font-weight: bold;
  word-break: keep-all;
  cursor: pointer;
  &[data-is-selected='true'] {
    @include color-accent-primary;
    border-color: $theme-accent-primary-default;
  }
  &[data-is-disabled='true'] {
    @include color-ui-primary-inactive;
    pointer-events: none;
  }
}
</style>
