<template>
  <vue-slider
    :model-value="modelValue"
    :min="min"
    :max="max"
    :disabled="disabled"
    :tooltip="tooltip"
    :tooltip-formatter="tooltipFormatter"
    :dot-size="12"
    @change="onChange"
  />
</template>

<script lang="ts" setup>
import type { TooltipFormatter, TooltipProp } from 'vue-slider-component'
import VueSlider from 'vue-slider-component'

withDefaults(
  defineProps<{
    modelValue: number
    disabled?: boolean
    min?: number
    max?: number
    tooltipFormatter?: TooltipFormatter
    tooltip?: TooltipProp
  }>(),
  {
    disabled: false,
    min: 0,
    max: 100,
    tooltip: 'active'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', _val: number): void
}>()

const onChange = (val: number) => {
  emit('update:modelValue', val)
}
</script>

<style lang="scss">
$dotBgColor: $theme-ui-secondary-default;
$dotShadow: none;

$bgColor: var(--specific-slider-background);
$themeColor: $theme-ui-secondary-default;

$tooltipBgColor: $theme-ui-secondary-default;

@import 'vue-slider-component/lib/theme/default.scss';
</style>
