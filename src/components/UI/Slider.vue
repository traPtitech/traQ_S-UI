<template>
  <vue-slider
    :value="value"
    @input="onInput"
    :min="min"
    :max="max"
    :disabled="disabled"
    :tooltip="tooltip"
    :tooltip-formatter="tooltipFormatter"
    :dot-size="12"
    :dot-style="styles.dotStyle"
    :rail-style="styles.railStyle"
    :process-style="styles.processStyle"
    :tooltip-style="styles.tooltipStyle"
  />
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import { makeStyles } from '@/lib/styles'
import { transparentize } from '@/lib/util/color'
import { TooltipFormatter } from 'vue-slider-component/typings/typings'

const useStyles = () =>
  reactive({
    dotStyle: makeStyles(theme => ({
      background: theme.ui.secondary,
      boxShadow: 'none'
    })),
    railStyle: makeStyles(theme => ({
      background: transparentize(theme.ui.secondary, 0.5)
    })),
    processStyle: makeStyles(theme => ({
      background: theme.ui.secondary
    })),
    tooltipStyle: makeStyles(theme => ({
      background: theme.ui.secondary,
      borderColor: theme.ui.secondary
    }))
  })

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
    const styles = useStyles()
    const onInput = (val: number | string) => {
      context.emit('input', val)
    }
    return { styles, onInput }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
