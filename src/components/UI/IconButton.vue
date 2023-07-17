<template>
  <button :class="$style.container" :title="title" :aria-disabled="disabled">
    <a-icon :class="$style.icon" :mdi="iconMdi" :name="iconName" :size="size" />
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
    size?: number
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
  &:focus {
    border: black 1px solid;
  }
}
.icon {
  cursor: pointer;
  .container[aria-disabled='true'] & {
    cursor: not-allowed;
  }
}
</style>
