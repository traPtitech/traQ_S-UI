<template>
  <div :class="$style.container">
    <mobile-navigation-bar v-if="isMobile" />
    <desktop-navigation-bar v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import DesktopNavigationBar from '/@/components/Main/NavigationBar/DesktopNavigationBar.vue'
import MobileNavigationBar from '/@/components/Main/NavigationBar/MobileNavigationBar.vue'
import store from '/@/store'

export default defineComponent({
  name: 'NavigationBar',
  components: { DesktopNavigationBar, MobileNavigationBar },
  setup() {
    const isMobile = computed(() => store.state.ui.isMobile)
    return { isMobile }
  }
})
</script>

<style lang="scss" module>
.container {
  height: 100%;
}
</style>
