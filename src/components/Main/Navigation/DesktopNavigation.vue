<template>
  <div :class="$style.container" :style="navigationStyle">
    DESKTOP
    <NavigationSelector />
    <NavigationContent />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent.vue'
import NavigationSelector from '@/components/Main/Navigation/NavigationSelector.vue'
import store from '@/store'

export default defineComponent({
  name: 'Navigation',
  components: { NavigationContent, NavigationSelector },
  setup() {
    const navigationStyle = computed(() => ({
      background: store.state.app.theme.background.secondary,
      color: store.state.app.theme.ui.primary
    }))
    return { navigationStyle }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
