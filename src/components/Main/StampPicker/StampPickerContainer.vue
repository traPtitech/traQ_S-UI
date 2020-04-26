<template>
  <portal v-show="state.isStampPickerShown" :to="state.targetPortalName">
    <stamp-picker
      :style="styles.stampPicker"
      :class="[state.isPositionAbsolute ? $style.positionAbsolute : '']"
    />
  </portal>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, Ref } from '@vue/composition-api'
import store from '@/store'
import StampPicker from './StampPicker.vue'
import { makeStyles } from '@/lib/styles'
import { Place } from '@/store/ui/stampPicker'

const useStampPicker = () => {
  const state = reactive({
    targetPortalName: computed(
      () => store.state.ui.stampPicker.targetPortalName
    ),
    isStampPickerShown: computed(
      () => store.getters.ui.stampPicker.isStampPickerShown
    ),
    isPositionAbsolute: computed(
      () => store.state.ui.stampPicker.position !== undefined
    )
  })
  return { state }
}

const useStyles = (position: Ref<Place | undefined>) =>
  reactive({
    stampPicker: makeStyles(theme => {
      const height = 320
      const width = 340
      const margin = 20
      return {
        top: position.value
          ? `min(calc(100vh - ${height + margin}px), ${position.value.y}px)`
          : '',
        left: position.value
          ? `min(${Math.max(
              position.value.x,
              width + margin
            )}px, calc(100vw - ${margin}px))`
          : ''
      }
    })
  })

export default defineComponent({
  name: 'StampPickerContainer',
  components: {
    StampPicker
  },
  setup() {
    const { state } = useStampPicker()
    const position = computed(() => store.state.ui.stampPicker.position)
    const styles = useStyles(position)
    return { state, styles }
  }
})
</script>

<style lang="scss" module>
.positionAbsolute {
  position: absolute;
  z-index: 999;
  transform: translateX(-100%);
}
</style>
