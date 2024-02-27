<template>
  <icon-button
    :icon-name="iconName"
    :icon-mdi="iconMdi"
    :class="$style.container"
  />
</template>

<script lang="ts" setup>
import IconButton from '/@/components/UI/IconButton.vue'

withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
  }>(),
  {
    iconMdi: false
  }
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary-inactive;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  &:hover,
  &:focus {
    @include color-ui-secondary;
  }
}
</style>
