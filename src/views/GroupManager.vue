<template>
  <div v-if="isLoginCheckDone" :class="$style.container">
    <mobile-group-manager v-if="isMobile" />
    <desktop-group-manager v-else />
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { changeViewState } from '@/lib/websocket'
import useLoginCheck from './use/loginCheck'
import useIsMobile from '@/use/isMobile'
import DesktopGroupManager from '@/components/GroupManager/DesktopGroupManager.vue'
import MobileGroupManager from '@/components/GroupManager/MobileGroupManager.vue'

export default defineComponent({
  name: 'GroupManager',
  components: {
    DesktopGroupManager,
    MobileGroupManager
  },
  setup() {
    const { isMobile } = useIsMobile()

    onBeforeRouteUpdate(() => {
      // グループ管理画面を開いたときは閲覧チャンネルを消す
      changeViewState(null)
    })

    // ログイン必要ルート
    const { isLoginCheckDone } = useLoginCheck()
    return { isLoginCheckDone, isMobile }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
