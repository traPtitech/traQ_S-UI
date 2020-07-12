<template>
  <div :class="$style.container">
    <div :class="$style.bar" :style="style" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'

export default defineComponent({
  name: 'MessageInputUploadProgress',
  props: {
    progress: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const style = computed(() => ({
      transform: `translateX(-${(1 - props.progress) * 100}%)`
    }))

    return { style }
  }
})
</script>

<style lang="scss" module>
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  overflow: hidden;
}
.bar {
  height: 100%;
  width: 100%;
  background: $theme-ui-primary;
  opacity: 0.3;
  transition: transform 0.1s ease;
  will-change: transform;
}
</style>
