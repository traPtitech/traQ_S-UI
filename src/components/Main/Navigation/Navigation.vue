<template>
  <div :class="$style.container">
    <mobile-navigation v-if="isMobile" />
    <desktop-navigation v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import DesktopNavigation from '@/components/Main/Navigation/DesktopNavigation.vue'
import MobileNavigation from '@/components/Main/Navigation/MobileNavigation.vue'
import store from '@/store'

export default defineComponent({
  name: 'Navigation',
  components: { DesktopNavigation, MobileNavigation },
  setup() {
    const isMobile = computed(() => store.getters.ui.isMobile)
    return { isMobile }
  }
})
</script>

<style lang="scss" module>
.container {
  // TODO 上に移す
  width: 320px;
  height: 100%;
}
</style>
