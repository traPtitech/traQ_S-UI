<template>
  <div :class="$style.container">
    <MobileNavigationBar v-if="isMobile" />
    <DesktopNavigationBar v-else />
  </div>
</template>

<script lang="ts" setup>
import DesktopNavigationBar from '/@/components/Main/NavigationBar/DesktopNavigationBar.vue'
import MobileNavigationBar from '/@/components/Main/NavigationBar/MobileNavigationBar.vue'
import useResponsive from '/@/composables/useResponsive'

const { isMobile } = useResponsive()
</script>

<style lang="scss" module>
.container {
  height: 100%;
}
</style>
