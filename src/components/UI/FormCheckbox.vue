<template>
  <label :class="$style.checkbox">
    <form-checkbox-inner v-model="modelValue" />
    <slot />
  </label>
</template>

<script lang="ts" setup>
import FormCheckboxInner from './FormCheckboxInner.vue'

const modelValue = defineModel<boolean>({ default: false })
</script>

<style lang="scss" module>
.checkbox {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
</style>
