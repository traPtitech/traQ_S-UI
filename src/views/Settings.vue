<template>
  <div v-if="hasInitialFetchDone" :class="$style.container">
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
import { defineComponent, Ref, ref, watch, computed, onMounted } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { RouteName } from '@/router'
import { defaultSettingsName } from '@/router/settings'
import useIsMobile from '@/use/isMobile'
import useInitialFetch from './use/initialFetch'
import DesktopSettingModal from '@/components/Settings/DesktopSetting.vue'
import MobileSettingModal from '@/components/Settings/MobileSetting.vue'
import store from '@/store'

const useSettingsRootPathWathcer = (isMobile: Ref<boolean>) => {
  const route = useRoute()
  const router = useRouter()
  const redirectIfNeeded = () => {
    if (!isMobile.value && route.name === RouteName.Settings) {
      router.replace({ name: defaultSettingsName })
    }
  }
  onMounted(redirectIfNeeded)
  watch([computed(() => route.name), isMobile], redirectIfNeeded)
}

export default defineComponent({
  name: 'Settings',
  setup(_, context) {
    const { isMobile } = useIsMobile()
    useSettingsRootPathWathcer(isMobile)

    onBeforeRouteLeave(() => {
      store.commit.ui.settings.resetSettingsRootShown()
      return true
    })

    const hasInitialFetchDone = ref(false)
    useInitialFetch(context).then(() => {
      hasInitialFetchDone.value = true
    })

    return { isMobile, hasInitialFetchDone }
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
