<template>
  <div v-if="isLoginCheckDone" :class="$style.container">
    <mobile-group-manager v-if="isMobile" />
    <desktop-group-manager v-else />
  </div>
  <div v-else />
</template>

<script lang="ts" setup>
import DesktopGroupManager from '/@/components/GroupManager/DesktopGroupManager.vue'
import MobileGroupManager from '/@/components/GroupManager/MobileGroupManager.vue'
import useLoginCheck from './composables/useLoginCheck'
import { useResponsiveStore } from '/@/store/ui/responsive'

const { isMobile } = useResponsiveStore()

// ログイン必要ルート
const { isLoginCheckDone } = useLoginCheck()
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
