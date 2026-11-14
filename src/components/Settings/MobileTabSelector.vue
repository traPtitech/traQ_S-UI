<template>
  <div :class="$style.container">
    <div>
      <MobileTabSelectorItem
        v-for="navigation in navigations"
        :key="navigation.routeName"
        :route-name="navigation.routeName"
        :icon-name="navigation.iconName"
        :icon-mdi="navigation.iconMdi"
      />
      <SafariWarning :class="$style.safariWarning" />
    </div>
    <VersionInfo :class="$style.version" />
  </div>
</template>

<script lang="ts" setup>
import VersionInfo from '/@/components/UI/VersionInfo.vue'

import MobileTabSelectorItem from './MobileTabSelectorItem.vue'
import SafariWarning from './SafariWarning.vue'
import { navigations } from './composables/useNavigation'
</script>

<style lang="scss" module>
.container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.safariWarning {
  margin: 40px 20px;
}
.version {
  margin-bottom: 16px;
}
</style>
