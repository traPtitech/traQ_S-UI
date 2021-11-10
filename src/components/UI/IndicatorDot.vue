<template>
  <div :class="$style.container" :style="style" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'IndicatorDot',
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
    const style = computed(() => ({
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
