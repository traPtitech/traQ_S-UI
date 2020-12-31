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
import store from '@/_store'
import StampPicker from './StampPicker.vue'
import { Place } from '@/_store/ui/stampPicker'
import { PositionOf } from '@/_store/ui/stampPicker/state'

const useStyles = (
  position: Ref<Place | undefined>,
  positionOf: Ref<PositionOf>
) =>
  reactive({
    stampPicker: computed(() => {
      if (!position.value) return {}
      const height = 320
      const width = 340
      const margin = 16
      const left = `min(${Math.max(
        position.value.x,
        width + margin
      )}px, calc(100vw - ${margin}px))`
      if (positionOf.value === 'top-right') {
        return {
          top: `min(calc(100vh - ${height + margin}px), ${position.value.y}px)`,
          left
        }
      }
      if (positionOf.value === 'bottom-right') {
        return {
          bottom: `min(calc(100vh - ${height + margin}px), calc(100vh - ${
            position.value.y
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
    const isStampPickerShown = computed(
      () => store.getters.ui.stampPicker.isStampPickerShown
    )
    const position = computed(() => store.state.ui.stampPicker.position)
    const positionOf = computed(() => store.state.ui.stampPicker.positionOf)
    const styles = useStyles(position, positionOf)
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
