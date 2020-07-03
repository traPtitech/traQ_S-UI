<template>
  <div :class="$style.container" :style="style" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'

export default defineComponent({
  name: 'Indicator',
  props: {
    size: {
      type: Number,
      default: 10
    },
    borderWidth: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const style = makeStyles(theme => ({
      borderWidth: `${props.borderWidth}px`,
      width: `${props.size}px`,
      height: `${props.size}px`
    }))
    return { style }
  }
})
</script>

<style lang="scss" module>
.container {
  border: {
    style: solid;
    radius: 50%;
  }
}
</style>
