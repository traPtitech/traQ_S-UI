<template>
  <div v-if="isLoginCheckDone" :class="$style.container">
    <MobileGroupManager v-if="isMobile" />
    <DesktopGroupManager v-else />
  </div>
  <div v-else />
</template>

<script lang="ts" setup>
import DesktopGroupManager from '/@/components/GroupManager/DesktopGroupManager.vue'
import MobileGroupManager from '/@/components/GroupManager/MobileGroupManager.vue'
import useResponsive from '/@/composables/useResponsive'

import useLoginCheck from './composables/useLoginCheck'

const { isMobile } = useResponsive()

// ログイン必要ルート
const { isLoginCheckDone } = useLoginCheck()
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
