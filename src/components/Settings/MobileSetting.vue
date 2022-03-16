<template>
  <div :class="$style.container">
    <mobile-tab-selector v-show="isSettingsRoot" />
    <mobile-tab-frame v-show="!isSettingsRoot">
      <slot />
    </mobile-tab-frame>
  </div>
</template>

<script lang="ts" setup>
import MobileTabSelector from './MobileTabSelector.vue';
import MobileTabFrame from './MobileTabFrame.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router'
import { RouteName } from '/@/router'

const route = useRoute()
const isSettingsRoot = computed(() => route.name === RouteName.Settings)
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
