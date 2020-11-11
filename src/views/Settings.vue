<template>
  <div v-if="hasInitialFetchForSettingsDone" :class="$style.container">
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
import { RouteName } from '@/router'
import { defaultSettingsName } from '@/router/settings'
import useIsMobile from '@/use/isMobile'
import DesktopSettingModal from '@/components/Settings/DesktopSetting.vue'
import MobileSettingModal from '@/components/Settings/MobileSetting.vue'
import store from '@/store'
import { changeViewState } from '@/lib/websocket'
import useLoginCheck from './use/loginCheck'

const useSettingsRootPathWatcher = (isMobile: Ref<boolean>) => {
  const route = useRoute()
  const router = useRouter()
  const redirectOrMarkRootIfNeeded = () => {
    if (route.name !== RouteName.Settings) {
      return
    }
    if (isMobile.value) {
      store.commit.ui.settings.setSettingsRootShown(true)
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
  setup() {
    const { isMobile } = useIsMobile()
    useSettingsRootPathWatcher(isMobile)

    onBeforeRouteLeave(() => {
      store.commit.ui.settings.setSettingsRootShown(false)
      return true
    })

    onBeforeRouteUpdate(() => {
      // 設定画面を開いたときは閲覧チャンネルを消す
      changeViewState(null)
    })

    const execIfEmpty = <T extends keyof typeof store.state.entities>(
      key: T,
      exector: () => Promise<void>
    ) =>
      Object.entries(store.state.entities[key]).length > 0
        ? undefined
        : exector()

    // ログイン必要ルート
    const hasInitialFetchForSettingsDone = ref(false)
    useLoginCheck(async () => {
      await Promise.all([
        execIfEmpty('stamps', store.dispatch.entities.fetchStamps),
        execIfEmpty(
          'stampPalettes',
          store.dispatch.entities.fetchStampPalettes
        ),
        // ホームチャンネルの選択などに必要
        execIfEmpty('channels', store.dispatch.entities.fetchChannels),
        // スタンプの所有者変更に必要
        execIfEmpty('users', store.dispatch.entities.fetchUsers)
      ])

      hasInitialFetchForSettingsDone.value = true
    })

    return { isMobile, hasInitialFetchForSettingsDone }
  },
  components: {
    DesktopSettingModal,
    MobileSettingModal
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
