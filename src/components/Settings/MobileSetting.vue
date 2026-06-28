<template>
  <div :class="$style.container">
    <MobileTabSelector v-show="isSettingsRoot" />
    <MobileTabFrame v-show="!isSettingsRoot">
      <slot />
    </MobileTabFrame>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { RouteName } from '/@/router'

import MobileTabFrame from './MobileTabFrame.vue'
import MobileTabSelector from './MobileTabSelector.vue'

const route = useRoute()
const isSettingsRoot = computed(() => route.name === RouteName.Settings)
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
