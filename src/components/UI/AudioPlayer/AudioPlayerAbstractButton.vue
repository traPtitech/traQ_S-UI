<template>
  <div :class="$style.container" :aria-disabled="disabled">
    <a-icon :mdi="iconMdi" :name="iconName" :size="size" />
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';

withDefaults(defineProps<{
    size: number,
    iconName: string,
    iconMdi?: boolean,
    disabled?: boolean
}>(), {
    iconMdi: false,
    disabled: false
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
  &:not([aria-disabled='true']):hover {
    background: rgba(32, 33, 36, 0.06);
  }
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
