<template>
  <button :class="$style.container" :title="title" :aria-disabled="disabled">
    <AIcon :mdi="iconMdi" :name="iconName" />
  </button>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

withDefaults(
  defineProps<{
    iconName: string
    iconMdi?: boolean
    title?: string
    disabled?: boolean
  }>(),
  {
    iconMdi: false,
    disabled: false
  }
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  cursor: pointer;

  &[aria-disabled='true'] {
    cursor: not-allowed;
  }
}
</style>
