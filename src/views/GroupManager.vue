<template>
  <div v-if="isLoginCheckDone" :class="$style.container">po</div>
  <div v-else></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { changeViewState } from '@/lib/websocket'
import useLoginCheck from './use/loginCheck'

export default defineComponent({
  name: 'GroupManager',
  components: {},
  setup() {
    onBeforeRouteUpdate(() => {
      // グループ管理画面を開いたときは閲覧チャンネルを消す
      changeViewState(null)
    })

    // ログイン必要ルート
    const { isLoginCheckDone } = useLoginCheck()
    return { isLoginCheckDone }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
}
</style>
