<template>
  <teleport v-if="isStampPickerShown" to="#stamp-picker-popup">
    <keep-alive>
      <stamp-picker
        :style="styles.stampPicker"
        :class="$style.positionAbsolute"
      />
    </keep-alive>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, Ref } from 'vue'
import StampPicker from './StampPicker.vue'
import { useStampPicker, AlignmentPosition } from '/@/store/ui/stampPicker'
import { Point } from '/@/lib/basic/point'

const useStyles = (
  position: Ref<Point | undefined>,
  alignment: Ref<AlignmentPosition>
) =>
  reactive({
    stampPicker: computed(() => {
      if (!position.value) return {}
      const height = 320
      const width = 340
      const margin = 16
      if (alignment.value === 'top-left') {
        return {
          top: `min(calc(100vh - ${height + margin}px), ${position.value.y}px)`,
          left: `${position.value.x}px`
        }
      }

      const left = `min(${Math.max(
        position.value.x,
        width + margin
      )}px, calc(100vw - ${margin}px))`
      if (alignment.value === 'top-right') {
        return {
          top: `min(calc(100vh - ${height + margin}px), ${position.value.y}px)`,
          left,
          transform: 'translateX(-100%)'
        }
      }
      if (alignment.value === 'bottom-right') {
        return {
          bottom: `min(calc(100vh - ${height + margin}px), calc(100vh - ${
            position.value.y
          }px))`,
          left,
          transform: 'translateX(-100%)'
        }
      }
      throw new Error(`Unexpected alignment value: ${alignment.value}`)
    })
  })

export default defineComponent({
  name: 'StampPickerContainer',
  components: {
    StampPicker
  },
  setup() {
    const { position, alignment, isStampPickerShown } = useStampPicker()
    const styles = useStyles(position, alignment)
    return { isStampPickerShown, styles }
  }
})
</script>

<style lang="scss" module>
.positionAbsolute {
  position: absolute;
  z-index: $z-index-stamp-picker;
  contain: strict;
}
</style>
