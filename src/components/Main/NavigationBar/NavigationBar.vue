<template>
  <div :class="$style.container">
    <mobile-navigation-bar v-if="isMobile" />
    <desktop-navigation-bar v-else />
  </div>
</template>

<script lang="ts" setup>
import DesktopNavigationBar from '/@/components/Main/NavigationBar/DesktopNavigationBar.vue';
import MobileNavigationBar from '/@/components/Main/NavigationBar/MobileNavigationBar.vue';
import { useResponsiveStore } from '/@/store/ui/responsive'

const { isMobile } = useResponsiveStore()
</script>

<style lang="scss" module>
.container {
  height: 100%;
}
</style>
