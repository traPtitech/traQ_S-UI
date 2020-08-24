<template>
  <div :class="$style.container">
    <span :class="$style.placeholder">{{ placeholder }}</span>
    <span :class="$style.actual" :style="style">{{ actual }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'

type Align = 'left' | 'right'

const useStyle = (props: { align: Align }) =>
  computed(() => ({
    [props.align]: '0'
  }))

export default defineComponent({
  name: 'SemiFixedSizeText',
  props: {
    actual: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    align: {
      type: String as PropType<Align>,
      default: 'left' as const
    }
  },
  setup(props) {
    const style = useStyle(props)
    return { style }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
}
.placeholder {
  visibility: hidden;
}
.actual {
  position: absolute;
  top: 0;
}
</style>
