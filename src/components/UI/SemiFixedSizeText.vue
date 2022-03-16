<template>
  <div :class="$style.container">
    <span :class="$style.placeholder">{{ placeholder }}</span>
    <span :class="$style.actual" :style="style">{{ actual }}</span>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'

type Align = 'left' | 'right'

const useStyle = (props: { align: Align }) =>
  computed(() => ({
    [props.align]: '0'
  }))
</script>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    actual: string
    placeholder: string
    align?: Align
  }>(),
  {
    align: 'left' as const
  }
)

const style = useStyle(props)
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
