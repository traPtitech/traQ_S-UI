<template>
  <div v-if="isLoginCheckDone" :class="$style.container">
    <mobile-setting-modal v-if="isMobile">
      <router-view />
    </mobile-setting-modal>
    <desktop-setting-modal v-else>
      <router-view />
    </desktop-setting-modal>
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, watch, toRef } from 'vue'
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter
} from 'vue-router'
import { RouteName } from '/@/router'
import { defaultSettingsName } from '/@/router/settings'
import useIsMobile from '/@/use/isMobile'
import DesktopSettingModal from '/@/components/Settings/DesktopSetting.vue'
import MobileSettingModal from '/@/components/Settings/MobileSetting.vue'
import { changeViewState } from '/@/lib/websocket'
import useLoginCheck from './use/loginCheck'

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

export default defineComponent({
  name: 'Settings',
  components: {
    DesktopSettingModal,
    MobileSettingModal
  },
  setup() {
    const { isMobile } = useIsMobile()

    const settingsRootShown = ref(false)
    onBeforeRouteLeave(() => {
      settingsRootShown.value = false
    })

    useSettingsRootPathWatcher(isMobile, settingsRootShown)

    onBeforeRouteUpdate(() => {
      // 設定画面を開いたときは閲覧チャンネルを消す
      changeViewState(null)
    })

    // ログイン必要ルート
    const { isLoginCheckDone } = useLoginCheck()

    return { isMobile, isLoginCheckDone }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
