<template>
  <div :class="$style.container">
    <mobile-tab-selector
      v-show="isSettingsRoot"
      @navigation-change="onNavigationChange"
      :current-navigation="currentNavigation"
    />
    <mobile-tab-frame
      v-show="!isSettingsRoot"
      :current-navigation="currentNavigation"
      @back="onBack"
    >
      <slot />
    </mobile-tab-frame>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import MobileTabSelector from './MobileTabSelector.vue'
import MobileTabFrame from './MobileTabFrame.vue'
import { useRoute } from 'vue-router'
import { RouteName } from '@/router'

export default defineComponent({
  name: 'MobileSettingModal',
  setup() {
    const route = useRoute()
    const isSettingsRoot = computed(() => route.name === RouteName.Settings)
    return { isSettingsRoot }
  },
  components: {
    MobileTabSelector,
    MobileTabFrame
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
