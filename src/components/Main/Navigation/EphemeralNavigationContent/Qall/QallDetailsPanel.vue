<template>
  <div :class="$style.container" :style="styles.container">
    <slider v-model="state.po" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import Slider from '@/components/UI/Slider.vue'
import store from '@/store'

export default defineComponent({
  name: 'QallDetailsPanel',
  components: {
    Slider
  },
  setup() {
    const state = reactive({
      po: 0
    })
    const users = computed(() => {
      const currentSession = store.getters.app.rtc.qallSession
      if (!currentSession) {
        return []
      }
      return store.state.app.rtc.sessionUsersMap[currentSession.sessionId] ?? []
    })
    return { state }
  }
})
</script>

<style lang="scss" module>
.container {
}
</style>
