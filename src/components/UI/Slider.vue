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

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import VueSlider from 'vue-slider-component'
import { TooltipFormatter } from 'vue-slider-component/typings/typings'

export default defineComponent({
  name: 'Slider',
  components: {
    VueSlider
  },
  props: {
    value: {
      type: [Number, String] as PropType<number | string>,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    tooltipFormatter: [String, Function] as PropType<TooltipFormatter>,
    tooltip: {
      type: String as PropType<
        'none' | 'always' | 'hover' | 'focus' | 'active'
      >,
      default: 'active'
    }
  },
  setup(props, context) {
    const onChange = (val: number | string) => {
      context.emit('changeValue', val)
    }
    return { onChange }
  }
})
</script>

<style lang="scss">
$dotBgColor: $theme-ui-secondary;
$dotShadow: none;

$bgColor: $theme-ui-secondary--05;
$themeColor: $theme-ui-secondary;

$tooltipBgColor: $theme-ui-secondary;

@import '/~/vue-slider-component/lib/theme/default.scss';
</style>
