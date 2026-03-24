<template>
  <div :class="$style.container">
    <ASlider
      v-model="modelValue"
      :class="[$style.range, 'form-range-slider']"
      :min="min"
      :max="max"
      :disabled="disabled"
      :tooltip="'none'"
      :interval="interval"
      :style="{ padding: '24px 0' }"
    />
    <SemiFixedSizeText
      align="right"
      :actual="showValue"
      :placeholder="maxText"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import ASlider from '/@/components/UI/ASlider.vue'

import SemiFixedSizeText from './SemiFixedSizeText.vue'

const modelValue = defineModel<number>({ required: true })

const props = withDefaults(
  defineProps<{
    maxText: string
    min?: number
    max?: number
    disabled?: boolean
    interval?: number
    format: (v: number) => string
  }>(),
  {
    disabled: false
  }
)

const showValue = computed(() => props.format(modelValue.value))
</script>

<style lang="scss" module>
@use 'sass:meta';

.container {
  display: flex;
  align-items: center;
}

.range {
  flex: 1 1;
  margin-right: 16px;
}
</style>

<style lang="scss">
@use 'sass:meta';

.form-range-slider {
  @include meta.load-css(
    'vue-slider-component/lib/theme/default.scss',
    $with: (
      dotBgColor: $theme-accent-primary-background,
      dotShadow: none,
      bgColor: rgba(107, 125, 138, 0.5),
      themeColor: $theme-accent-primary-background
    )
  );
}
</style>
