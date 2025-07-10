<template>
  <vue-slider
    v-if="isClickPrevent"
    v-model="modelValue"
    :min="min"
    :max="max"
    :disabled="disabled"
    :interval="interval"
    :tooltip="tooltip"
    :tooltip-formatter="tooltipFormatter"
    :dot-size="12"
    @click.prevent
  />
  <vue-slider
    v-else
    v-model="modelValue"
    :min="min"
    :max="max"
    :disabled="disabled"
    :interval="interval"
    :tooltip="tooltip"
    :tooltip-formatter="tooltipFormatter"
    :dot-size="12"
  />
</template>

<script lang="ts" setup>
import type { TooltipFormatter, TooltipProp } from 'vue-slider-component'
import _VueSlider from 'vue-slider-component'

// 厳密な型がついていないのでanyにする
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VueSlider = _VueSlider as any

const modelValue = defineModel<number>({ required: true })

withDefaults(
  defineProps<{
    disabled?: boolean
    min?: number
    max?: number
    tooltipFormatter?: TooltipFormatter
    tooltip?: TooltipProp
    interval?: number
    isClickPrevent?: boolean
  }>(),
  {
    disabled: false,
    min: 0,
    max: 100,
    tooltip: 'active',
    isClickPrevent: false
  }
)
</script>

<style lang="scss">
@use 'vue-slider-component/lib/theme/default.scss' with (
  $dotBgColor: $theme-ui-secondary-default,
  $dotShadow: none,

  $bgColor: var(--specific-slider-background),
  $themeColor: $theme-ui-secondary-default,

  $tooltipBgColor: $theme-ui-secondary-default
);
</style>
