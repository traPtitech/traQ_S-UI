<template>
  <div :class="$style.container">
    <a-slider
      v-model="modelValue"
      :class="$style.range"
      :min="min"
      :max="max"
      :disabled="disabled"
      :tooltip="'none'"
      :interval="interval"
      :style="{ padding: '24px 0' }"
    />
    <semi-fixed-size-text
      align="right"
      :actual="showValue"
      :placeholder="maxText"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SemiFixedSizeText from './SemiFixedSizeText.vue'
import ASlider from '/@/components/UI/ASlider.vue'

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
  :global {
    @include meta.load-css(
      'vue-slider-component/lib/theme/default.scss',
      $with: (
        dotBgColor: $theme-accent-primary-background,
        dotShadow: none,

        bgColor: rgba(107, 125, 138, 0.5),
        // $theme-ui-secondary-default;
        themeColor: $theme-accent-primary-background
      )
    );
  }
}
</style>
