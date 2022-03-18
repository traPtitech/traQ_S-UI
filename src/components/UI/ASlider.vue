<template>
  <vue-slider
    :model-value="value"
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
import VueSlider from 'vue-slider-component'

withDefaults(
  defineProps<{
    value: number
    disabled?: boolean
    min?: number
    max?: number
    tooltipFormatter?: VueSlider['tooltipFormatter']
    tooltip?: VueSlider['tooltip']
  }>(),
  {
    disabled: false,
    min: 0,
    max: 100,
    tooltip: 'active'
  }
)

const emit = defineEmits<{
  (e: 'changeValue', _val: number): void
}>()

// vue sliderの型が変
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onChange: any = (val: number) => {
  emit('changeValue', val)
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
