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
import { defineComponent, reactive, computed } from 'vue'
import StampPicker from './StampPicker.vue'
import {
  useStampPickerStore,
  AlignmentPosition
} from '/@/providers/stampPicker'
import { Point } from '/@/lib/basic/point'

const useStyles = (state: {
  position: Point | undefined
  alignment: AlignmentPosition
}) =>
  reactive({
    stampPicker: computed(() => {
      if (!state.position) return {}
      const height = 320
      const width = 340
      const margin = 16
      if (state.alignment === 'top-left') {
        return {
          top: `min(calc(100vh - ${height + margin}px), ${state.position.y}px)`,
          left: `${state.position.x}px`
        }
      }

      const left = `min(${Math.max(
        state.position.x,
        width + margin
      )}px, calc(100vw - ${margin}px))`
      if (state.alignment === 'top-right') {
        return {
          top: `min(calc(100vh - ${height + margin}px), ${state.position.y}px)`,
          left,
          transform: 'translateX(-100%)'
        }
      }
      if (state.alignment === 'bottom-right') {
        return {
          bottom: `min(calc(100vh - ${height + margin}px), calc(100vh - ${
            state.position.y
          }px))`,
          left,
          transform: 'translateX(-100%)'
        }
      }
      throw new Error(`Unexpected alignment value: ${state.alignment}`)
    })
  })

export default defineComponent({
  name: 'StampPickerContainer',
  components: {
    StampPicker
  },
  setup() {
    const { state, isStampPickerShown } = useStampPickerStore()
    const styles = useStyles(state)
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
