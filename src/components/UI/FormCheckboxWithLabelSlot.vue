<template>
  <label :class="$style.checkbox">
    <form-checkbox-inner v-model="value" />
    <slot></slot>
  </label>
</template>

<script lang="ts" setup>
import FormCheckboxInner from './FormCheckboxInner.vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  {
    modelValue: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: boolean): void
}>()

const value = useModelValueSyncer(props, emit)
</script>

<style lang="scss" module>
.checkbox {
  cursor: pointer;

  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
}
</style>
