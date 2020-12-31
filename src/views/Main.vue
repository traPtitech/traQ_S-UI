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
    @touchcancel="touchendHandler"
  >
    <div :class="$style.homeContainer">
      <navigation v-show="shouldShowNav" :class="$style.navigationWrapper" />
      <main-view-frame
        :is-active="isMainViewActive"
        :hide-outer="hideOuter"
        :dim-inner="isSidebarCompletelyAppeared"
        :style="styles.mainViewWrapper"
        :class="$style.mainViewWrapper"
        @click.capture="onClickMainViewFrame"
      >
        <main-view :class="$style.mainView" />
      </main-view-frame>
      <div
        :class="$style.sidebarWrapper"
        :style="styles.sidebarWrapper"
        v-show="isMobile && isSidebarAppeared"
      >
        <!-- モバイル時はスワイプ表示するためここにportal表示 -->
        <div id="sidebar-mobile" :class="$style.sidebarPortal" />
      </div>
    </div>
    <modal-container />
    <stamp-picker-container />
    <message-tools-menu-container />
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  Ref,
  defineAsyncComponent
} from 'vue'
import { setupWebSocket } from '@/lib/websocket'
import { connectFirebase } from '@/lib/firebase'
import useIsMobile from '@/use/isMobile'
import useNavigationController from '@/use/navigationController'
import MainView from '@/components/Main/MainView/MainView.vue'
import MainViewFrame from '@/components/Main/MainView/MainViewFrame.vue'
import Navigation from '@/components/Main/Navigation/Navigation.vue'
import ModalContainer from '@/components/Modal/ModalContainer.vue'
import StampPickerContainer from '@/components/Main/StampPicker/StampPickerContainer.vue'
import useMainViewLayout from './use/mainViewLayout'
import useRouteWatcher from './use/routeWatcher'
import MessageToolsMenuContainer from '@/components/Main/MainView/MessageElement/MessageToolsMenuContainer.vue'
import useInitialFetch from './use/initialFetch'
import useToastStore from '@/use/toastStore'

const useStyles = (
  mainViewPosition: Readonly<Ref<number>>,
  sidebarPosition: Readonly<Ref<number>>
) =>
  reactive({
    mainViewWrapper: computed(() => ({
      transform: `translateX(${mainViewPosition.value}px)`
    })),
    sidebarWrapper: computed(() => ({
      transform: `translateX(${sidebarPosition.value}px)`
    }))
  })

const NotFound = defineAsyncComponent(
  () => import(/* webpackChunkName: "NotFound" */ '@/views/NotFound.vue')
)

export default defineComponent({
  name: 'Main',
  components: {
    Navigation,
    MainView,
    MainViewFrame,
    ModalContainer,
    StampPickerContainer,
    MessageToolsMenuContainer,
    NotFound
  },
  setup() {
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
      currentActiveDrawer
    } = useMainViewLayout(navWidth, sidebarWidth)
    const { addToast } = useToastStore()

    const { isMobile } = useIsMobile()
    const shouldShowNav = computed(() => !isMobile.value || isNavAppeared.value)
    const { closeNav } = useNavigationController()
    const hideOuter = computed(
      () => isMobile.value && isNavCompletelyAppeared.value
    )

    const { routeWatcherState, triggerRouteParamChange } = useRouteWatcher()
    useInitialFetch(() => {
      setupWebSocket()
      connectFirebase(onClick => {
        addToast({
          type: 'success',
          text: 'クリックでアップデートできます',
          timeout: 10000,
          onClick
        })
      })
      triggerRouteParamChange()
    })

    const styles = useStyles(mainViewPosition, sidebarPosition)

    const onClickMainViewFrame = (e: MouseEvent) => {
      if (!isMobile.value || !isNavCompletelyAppeared.value) {
        return
      }
      e.stopPropagation()
      closeNav()
    }

    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,

      routeWatcherState,

      shouldShowNav,
      hideOuter,
      isNavCompletelyAppeared,
      isSidebarCompletelyAppeared,
      isSidebarAppeared,
      isMainViewActive,
      isMobile,

      onClickMainViewFrame,

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
  @include background-tertiary;
  height: 100%;
  display: flex;
  [data-is-mobile] & {
    position: relative;
  }
}
.navigationWrapper {
  height: 100%;
  max-width: 360px;
  flex: 1 0 260px; // .mainViewWrapperのflexと調節する
  [data-is-mobile] & {
    position: absolute;
    top: 0;
    left: 0;
    width: 320px;
  }
}
.mainViewWrapper {
  flex: 12 1 320px; // .navigationViewWrapperのflexと調節する
}
.sidebarWrapper {
  @include background-secondary;
  position: absolute;
  top: 0;
  left: 100%;
  width: 320px;
  height: 100%;
  padding: 8px 0;
  overflow: {
    x: hidden;
    y: auto;
  }
}
.sidebarPortal {
  width: 100%;
  height: 100%;
}
.mainView {
  width: 100%;
  height: 100%;
}
</style>
