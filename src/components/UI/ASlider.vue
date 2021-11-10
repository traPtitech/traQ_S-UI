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
  name: 'ASlider',
  components: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- FIXME: 型がうまく効かないのでanyで逃げる
    VueSlider: VueSlider as any
  },
  props: {
    value: {
      type: Number,
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
    tooltipFormatter: {
      type: [String, Function] as PropType<TooltipFormatter>,
      default: undefined
    },
    tooltip: {
      type: String as PropType<
        'none' | 'always' | 'hover' | 'focus' | 'active'
      >,
      default: 'active' as const
    }
  },
  emits: {
    changeValue: (_val: number) => true
  },
  setup(props, { emit }) {
    const onChange = (val: number) => {
      emit('changeValue', val)
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
