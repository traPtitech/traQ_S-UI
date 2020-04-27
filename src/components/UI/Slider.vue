<template>
  <vue-slider
    :value="value"
    @input="onInput"
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
