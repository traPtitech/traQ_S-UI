<template>
  <not-found
    v-if="routeWatcherState.view === 'not-found'"
    :route-param="routeWatcherState.currentRouteParam"
    :route-name="routeWatcherState.currentRouteName"
  />
  <div
    v-else-if="routeWatcherState.view === 'main'"
    :class="$style.homeWrapper"
    @touchstart="touchstartHandler"
    @touchmove="touchmoveHandler"
    @touchend="touchendHandler"
  >
    <div :class="$style.homeContainer">
      <div :class="$style.navigationWrapper">
        <navigation />
      </div>
      <div :class="$style.mainViewWrapper" :style="mainViewWrapperStyle">
        <main-view-controller :is-active="isNavAppeared" />
      </div>
    </div>
    <modal-container />
    <stamp-picker-container />
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  watchEffect,
  watch,
  onBeforeMount
} from '@vue/composition-api'
import store from '@/store'
import { setupWebSocket } from '@/lib/websocket'
import MainViewController from '@/components/Main/MainView/MainViewController.vue'
import Navigation from '@/components/Main/Navigation/Navigation.vue'
import ModalContainer from '@/components/Main/Modal/ModalContainer.vue'
import StampPickerContainer from '@/components/Main/StampPicker/StampPickerContainer.vue'
import useSwipeDetector from '@/use/swipeDetector'
import useSwipeDrawer from '@/use/swipeDrawer'
import useRouteWatcher from './use/routeWatcher'

export default defineComponent({
  name: 'Home',
  components: {
    Navigation,
    MainViewController,
    ModalContainer,
    StampPickerContainer,
    NotFound: () =>
      import(/* webpackChunkName: "NotFound" */ '@/views/NotFound.vue')
  },
  setup(_, context) {
    const {
      swipeDetectorState,
      touchmoveHandler,
      touchstartHandler,
      touchendHandler
    } = useSwipeDetector()

    // TODO: 幅をどこかに移す
    const navWidth = 320
    const { swipeDrawerState, isAppeared } = useSwipeDrawer(
      swipeDetectorState,
      'right',
      navWidth,
      navWidth / 2,
      navWidth / 2
    )

    const mainViewWrapperStyle = computed(() => ({
      transform: `translateX(${swipeDrawerState.currentPosition}px)`
    }))

    const { routeWatcherState } = useRouteWatcher(context)

    setupWebSocket()

    onBeforeMount(async () => {
      try {
        await store.dispatch.domain.me.fetchMe()
      } catch {
        location.href = '/login'
      }
      // 初回fetch
      await Promise.all([
        store.dispatch.entities.fetchUsers(),
        store.dispatch.entities.fetchUserGroups(),
        store.dispatch.entities.fetchChannels(),
        store.dispatch.entities.fetchStamps()
      ])

      store.commit.app.setInitialFetchCompleted()
      store.dispatch.domain.stampCategory.constructStampCategories()
      store.dispatch.entities.fetchStampPalettes()
      store.dispatch.entities.fetchClipFolders()
      store.dispatch.domain.fetchChannelActivity()
      store.dispatch.domain.fetchOnlineUsers()
      store.dispatch.domain.me.fetchUnreadChannels()
      store.dispatch.domain.me.fetchStaredChannels()
      store.dispatch.domain.me.fetchStampHistory()

      // TODO: 全チャンネルについて取得する必要はないので遅延で良い
      store.dispatch.domain.me.fetchSubscriptions()
    })

    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,

      routeWatcherState,

      isNavAppeared: isAppeared,

      mainViewWrapperStyle
    }
  }
})
</script>

<style lang="scss" module>
.homeWrapper {
  height: 100%;
}
.homeContainer {
  height: 100%;
  display: flex;
  [data-is-mobile] & {
    position: relative;
  }
}
.navigationWrapper {
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  [data-is-mobile] & {
    position: absolute;
    top: 0;
    left: 0;
  }
}
.mainViewWrapper {
  width: 100%;
  height: 100%;
}
</style>
