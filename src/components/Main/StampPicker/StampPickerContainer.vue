<template>
  <teleport v-if="isStampPickerShown" to="#stamp-picker-popup">
    <keep-alive>
      <stamp-picker :style="style" :class="$style.positionAbsolute" />
    </keep-alive>
  </teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStampPicker } from '/@/store/ui/stampPicker'
import StampPicker from './StampPicker.vue'

const { position, alignment, isStampPickerShown } = useStampPicker()
const style = computed(() => {
  if (!position.value) return {}
  const height = 320
  const width = 340
  const margin = 16
  if (alignment.value === 'top-left') {
    return {
      top: `min(calc(100% - ${height + margin}px), ${position.value.y}px)`,
      left: `min(calc(100% - ${width}px), ${position.value.x}px)`
    }
  }

  const left = `min(${Math.max(
    position.value.x,
    width + margin
  )}px, calc(100vw - ${margin}px))`
  if (alignment.value === 'top-right') {
    return {
      top: `min(calc(100% - ${height + margin}px), ${position.value.y}px)`,
      left,
      transform: 'translateX(-100%)'
    }
  }
  if (alignment.value === 'bottom-right') {
    return {
      bottom: `min(calc(100% - ${height + margin}px), calc(100% - ${
        position.value.y
      }px))`,
      left,
      transform: 'translateX(-100%)'
    }
  }
  throw new Error(`Unexpected alignment value: ${alignment.value}`)
})
</script>

<style lang="scss" module>
.positionAbsolute {
  position: fixed;
  z-index: $z-index-stamp-picker;
  contain: strict;
}
</style>
