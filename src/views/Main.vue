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
    <div :class="$style.homeContainer" :style="styles.homeContainer">
      <navigation v-show="showNav" :class="$style.navigationWrapper" />
      <main-view-frame
        :is-active="isMainViewActive"
        :hide-outer="hideOuter"
        :dim-inner="isSidebarCompletelyAppeared"
        :style="styles.mainViewWrapper"
      >
        <main-view-controller :class="$style.mainViewWrapper" />
      </main-view-frame>
      <div
        :class="$style.sidebarWrapper"
        :style="styles.sidebarWrapper"
        v-if="isMobile"
        v-show="isSidebarAppeared"
      >
        <!-- モバイル時はスワイプ表示するためここにportal表示 -->
        <portal-target name="sidebar" v-if="isMobile" />
      </div>
    </div>
    <modal-container />
    <stamp-picker-container />
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, Ref } from '@vue/composition-api'
import { setupWebSocket } from '@/lib/websocket'
import { connectFirebase } from '@/lib/firebase'
import { makeStyles } from '@/lib/styles'
import useIsMobile from '@/use/isMobile'
import MainViewController from '@/components/Main/MainView/MainViewController.vue'
import MainViewFrame from '@/components/Main/MainView/MainViewFrame.vue'
import Navigation from '@/components/Main/Navigation/Navigation.vue'
import ModalContainer from '@/components/Main/Modal/ModalContainer.vue'
import StampPickerContainer from '@/components/Main/StampPicker/StampPickerContainer.vue'
import useMainViewLayout from './use/mainViewLayout'
import useRouteWatcher from './use/routeWatcher'
import useInitialFetch from './use/initialFetch'

const useStyles = (
  mainViewPosition: Readonly<Ref<number>>,
  sidebarPosition: Readonly<Ref<number>>
) =>
  reactive({
    mainViewWrapper: makeStyles(_ => ({
      transform: `translateX(${mainViewPosition.value}px)`
    })),
    sidebarWrapper: makeStyles(theme => ({
      transform: `translateX(${sidebarPosition.value}px)`,
      background: theme.background.secondary
    })),
    homeContainer: makeStyles(theme => ({
      background: theme.background.tertiary
    }))
  })

export default defineComponent({
  name: 'Main',
  components: {
    Navigation,
    MainViewController,
    MainViewFrame,
    ModalContainer,
    StampPickerContainer,
    NotFound: () =>
      import(/* webpackChunkName: "NotFound" */ '@/views/NotFound.vue')
  },
  setup(_, context) {
    const navWidth = 320
    const sidebarWidth = 256 + 64
    const {
      touchmoveHandler,
      touchstartHandler,
      touchendHandler,
      mainViewPosition,
      sidebarPosition,
      isNavAppeared,
      isNavCompletelyAppeared,
      isSidebarAppeared,
      isSidebarCompletelyAppeared,
      isMainViewActive,
      openSidebar: animateOpenSidebar,
      closeSidebar: animateCloseSidebar,
      currentActiveDrawer
    } = useMainViewLayout(navWidth, sidebarWidth)

    const { isMobile } = useIsMobile()
    const showNav = computed(() => !isMobile.value || isNavAppeared.value)
    const hideOuter = computed(
      () => isMobile.value && isNavCompletelyAppeared.value
    )

    const { routeWatcherState } = useRouteWatcher(context)

    setupWebSocket()
    connectFirebase()
    useInitialFetch(context)

    const styles = useStyles(mainViewPosition, sidebarPosition)

    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,

      routeWatcherState,

      showNav,
      hideOuter,
      isNavCompletelyAppeared,
      isSidebarCompletelyAppeared,
      isSidebarAppeared,
      isMainViewActive,
      isMobile,

      styles,
      currentActiveDrawer
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
.sidebarWrapper {
  position: absolute;
  top: 0;
  left: 100%;
  width: 320px;
  height: 100%;
  padding: 8px 0;
}
.mainViewWrapper {
  width: 100%;
  height: 100%;
}
</style>
