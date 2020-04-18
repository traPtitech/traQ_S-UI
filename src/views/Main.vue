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
      <navigation v-show="isNavAppeared" :class="$style.navigationWrapper" />
      <main-view-frame
        :is-active="isMainViewActive"
        :hide-outer="isNavCompletelyAppeared"
        :style="styles.mainViewWrapper"
      >
        <main-view-controller :class="$style.mainViewWrapper" />
      </main-view-frame>
      <div
        :class="$style.sidebarWrapper"
        :style="styles.sidebarWrapper"
        v-show="isSidebarAppeared"
      ></div>
    </div>
    <modal-container />
    <stamp-picker-container />
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import { defineComponent, reactive, Ref } from '@vue/composition-api'
import { setupWebSocket } from '@/lib/websocket'
import { makeStyles } from '@/lib/styles'
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
    sidebarWrapper: makeStyles(_ => ({
      transform: `translateX(${sidebarPosition.value}px)`
    })),
    homeContainer: makeStyles(theme => ({
      background: theme.background.tertiary
    }))
  })

export default defineComponent({
  name: 'Home',
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
    const sidebarWidth = 320
    const {
      touchmoveHandler,
      touchstartHandler,
      touchendHandler,
      mainViewPosition,
      sidebarPosition,
      isNavAppeared,
      isNavCompletelyAppeared,
      isSidebarAppeared,
      isMainViewActive
    } = useMainViewLayout(navWidth, sidebarWidth)

    const { routeWatcherState } = useRouteWatcher(context)

    setupWebSocket()

    useInitialFetch()

    const styles = useStyles(mainViewPosition, sidebarPosition)

    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,

      routeWatcherState,

      isNavAppeared,
      isNavCompletelyAppeared,
      isSidebarAppeared,
      isMainViewActive,

      styles
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
  background: red;
}
.mainViewWrapper {
  width: 100%;
  height: 100%;
}
</style>
