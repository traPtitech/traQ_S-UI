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
import { useStampPickerStore, Place, PositionOf } from '@/use/stampPicker'

const useStyles = (state: {
  position: Place | undefined
  positionOf: PositionOf
}) =>
  reactive({
    stampPicker: computed(() => {
      if (!state.position) return {}
      const height = 320
      const width = 340
      const margin = 16
      const left = `min(${Math.max(
        state.position.x,
        width + margin
      )}px, calc(100vw - ${margin}px))`
      if (state.positionOf === 'top-right') {
        return {
          top: `min(calc(100vh - ${height + margin}px), ${state.position.y}px)`,
          left
        }
      }
      if (state.positionOf === 'bottom-right') {
        return {
          bottom: `min(calc(100vh - ${height + margin}px), calc(100vh - ${
            state.position.y
          }px))`,
          left
        }
      }
    })
  })

export default defineComponent({
  name: 'StampPickerContainer',
  components: {
    StampPicker
  },
  setup() {
    const { state, isStampPickerShown } = useStampPickerStore()
    const position = computed(() => state.position)
    const positionOf = computed(() => state.positionOf)
    const styles = useStyles(state)
    return { isStampPickerShown, styles }
  }
})
</script>

<style lang="scss" module>
.positionAbsolute {
  position: absolute;
  z-index: $z-index-stamp-picker;
  transform: translateX(-100%);
  contain: strict;
}
</style>
