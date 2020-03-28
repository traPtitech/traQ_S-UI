<template>
  <portal v-if="state.shouldShowStampPicker" :to="state.targetPortalName">
    <stamp-picker />
  </portal>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import StampPicker from './StampPicker.vue'

const useStampPicker = () => {
  const state = reactive({
    targetPortalName: computed(
      () => store.state.ui.stampPicker.targetPortalName
    ),
    shouldShowStampPicker: computed(
      () => store.getters.ui.stampPicker.shouldShowStampPicker
    )
  })
  return { state }
}

export default defineComponent({
  name: 'StampPickerContainer',
  components: {
    StampPicker
  },
  setup() {
    const { state } = useStampPicker()
    return { state }
  }
})
</script>
