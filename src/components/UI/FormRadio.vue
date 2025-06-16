<template>
  <label :class="$style.label">
    <input
      v-model="value"
      type="radio"
      :class="$style.radio"
      v-bind="$attrs"
      :value="inputValue"
    />
    <div :class="$style.pseudoRadio" role="radio" :aria-checked="isChecked">
      <div :class="$style.pseudoRadioInner" />
    </div>
    {{ label }}
  </label>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useModelValueSyncer } from '/@/composables/useModelSyncer'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    inputValue?: string
    onSecondary?: boolean
    label?: string
  }>(),
  {
    modelValue: '',
    inputValue: '',
    onSecondary: false,
    label: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: string): void
}>()

const value = useModelValueSyncer(props, emit)
const isChecked = computed(() => props.inputValue === value.value)
</script>

<style lang="scss" module>
.label {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  font-weight: bold;
  cursor: pointer;

  border: solid 2px transparent;
  border-radius: 4px;
  &:focus-within {
    border-color: $theme-accent-focus-default;
  }
  &:has(.radio:not(:checked)) {
    opacity: 0.5;
  }
}

.radio {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
}

.pseudoRadio {
  display: inline-block;
  position: relative;
  height: 13px;
  width: 13px;
  border: solid 2px $theme-ui-primary-default;
  border-radius: 50%;
}
.pseudoRadioInner {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 5px;
  width: 5px;
  margin: auto;
  border-radius: 50%;
  .pseudoRadio[aria-checked='true'] & {
    background: $theme-ui-primary-background;
  }
}
</style>
