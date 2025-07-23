<template>
  <div v-if="isLoginCheckDone" :class="$style.container">
    <mobile-setting-modal v-if="isMobile">
      <router-view />
    </mobile-setting-modal>
    <desktop-setting-modal v-else>
      <router-view />
    </desktop-setting-modal>
  </div>
  <div v-else />
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { ref, watch, toRef } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { RouteName } from '/@/router'
import { defaultSettingsName } from '/@/router/settings'
import { useResponsiveStore } from '/@/store/ui/responsive'
import useLoginCheck from './composables/useLoginCheck'

const useSettingsRootPathWatcher = (
  isMobile: Ref<boolean>,
  settingsRootShown: Ref<boolean>
) => {
  const route = useRoute()
  const router = useRouter()
  const redirectOrMarkRootIfNeeded = () => {
    if (route.name !== RouteName.Settings) {
      return
    }
    if (isMobile.value) {
      settingsRootShown.value = true
    } else {
      router.replace({ name: defaultSettingsName })
    }
  }
  watch([toRef(route, 'name'), isMobile], redirectOrMarkRootIfNeeded, {
    immediate: true
  })
}
</script>

<script lang="ts" setup>
import DesktopSettingModal from '/@/components/Settings/DesktopSetting.vue'
import MobileSettingModal from '/@/components/Settings/MobileSetting.vue'

const { isMobile } = useResponsiveStore()

const settingsRootShown = ref(false)
onBeforeRouteLeave(() => {
  settingsRootShown.value = false
})

useSettingsRootPathWatcher(isMobile, settingsRootShown)

// ログイン必要ルート
const { isLoginCheckDone } = useLoginCheck()
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
