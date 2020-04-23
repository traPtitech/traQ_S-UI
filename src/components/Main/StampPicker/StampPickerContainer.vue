<template>
  <portal v-show="state.isStampPickerShown" :to="state.targetPortalName">
    <stamp-picker
      :style="styles.stampPicker"
      :class="[state.isAsMessageStampPicker ? $style.asMessage : '']"
    />
  </portal>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import StampPicker from './StampPicker.vue'
import { makeStyles } from '@/lib/styles'
import { targetPortalName } from '@/views/Main.vue'

const useStampPicker = () => {
  const state = reactive({
    targetPortalName: computed(
      () => store.state.ui.stampPicker.targetPortalName
    ),
    isStampPickerShown: computed(
      () => store.getters.ui.stampPicker.isStampPickerShown
    ),
    isAsMessageStampPicker: computed(
      () => store.state.ui.stampPicker.targetPortalName === targetPortalName
    )
  })
  return { state }
}

const useStyles = (state: { isAsMessageStampPicker: boolean }) =>
  reactive({
    stampPicker: makeStyles(theme => {
      const height = 320
      const marginBottom = 20
      return {
        top: state.isAsMessageStampPicker
          ? `min(calc(100vh - ${height}px - ${marginBottom}px), ${store.state.ui.stampPicker.position.y}px)`
          : '',
        left: state.isAsMessageStampPicker
          ? `${store.state.ui.stampPicker.position.x}px`
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
    const styles = useStyles(state)
    return { state, styles }
  }
})
</script>

<style lang="scss" module>
.asMessage {
  position: absolute;
  z-index: 999;
  transform: translateX(-100%);
}
</style>
