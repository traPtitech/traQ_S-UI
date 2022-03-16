<template>
  <div :class="$style.container" :style="style" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: number
    borderWidth?: number
  }>(),
  {
    size: 10,
    borderWidth: 0
  }
)

const style = computed(() => ({
  borderWidth: `${props.borderWidth}px`,
  width: `${props.size}px`,
  height: `${props.size}px`
}))
</script>

<style lang="scss" module>
.container {
  border: {
    style: solid;
    radius: 50%;
  }
}
</style>
