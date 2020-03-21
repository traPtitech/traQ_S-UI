<template>
  <div :class="$style.app" :data-is-mobile="isMobile">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from './store'
import { setupWebSocket } from '@/lib/websocket'

const useWindowResizeObserver = () => {
  let lastCalled = 0
  const interval = 100
  const resizeHandler = () => {
    const now = Date.now()
    if (now - lastCalled < interval) return

    store.commit.ui.setViewportWidth(window.innerWidth)
    lastCalled = now
  }
  window.addEventListener('resize', resizeHandler)
  resizeHandler()
}

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    useWindowResizeObserver()
    const isMobile = computed(() => store.getters.ui.isMobile)
    setupWebSocket()

    // 初回fetch
    store.dispatch.entities.fetchUsers()
    store.dispatch.entities.fetchUserGroups()
    store.dispatch.entities.fetchChannels()
    store.dispatch.domain.fetchChannelActivity()
    store.dispatch.domain.me.fetchUnreadChannels()

    return {
      isMobile
    }
  }
})
</script>

<style lang="scss" module>
@import 'src/styles/global.scss';

.app {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}
</style>
