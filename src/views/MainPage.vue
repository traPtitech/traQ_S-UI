<template>
  <NotFoundPage
    v-if="routeWatcherState.view === 'not-found'"
    :route-param="routeWatcherState.currentRouteParam"
    :route-name="routeWatcherState.currentRouteName"
  />
  <div
    :class="$style.homeWrapper"
    @touchstart.passive="touchstartHandler"
    @touchmove.passive="touchmoveHandler"
    @touchend.passive="touchendHandler"
    @touchcancel="touchendHandler"
  >
    <div :class="$style.homeContainer">
      <NavigationBar v-show="shouldShowNav" :class="$style.navigationWrapper" />
      <MainViewFrame
        v-if="routeWatcherState.view === 'main'"
        :is-active="isMainViewActive"
        :hide-outer="hideOuter"
        :dim-inner="isSidebarCompletelyAppeared"
        :class="$style.mainViewWrapper"
        :style="styles.mainViewWrapper"
        @click.capture="onClickMainViewFrame"
      >
        <MainView :class="$style.mainView" />
      </MainViewFrame>
      <div
        v-show="isMobile && isSidebarAppeared"
        :class="$style.sidebarWrapper"
        :style="styles.sidebarWrapper"
      >
        <!-- モバイル時はスワイプ表示するためここにportal表示 -->
        <div id="sidebar-mobile" :class="$style.sidebarPortal" />
      </div>
    </div>
    <CommandPaletteContainer />
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, reactive } from 'vue'

import useNavigationController from '/@/composables/mainView/useNavigationController'
import useResponsive from '/@/composables/useResponsive'
import { connectFirebase } from '/@/lib/notification/notification'
import { useCommandPalette } from '/@/store/app/commandPalette'
import { useToastStore } from '/@/store/ui/toast'

import useEventListener from '../composables/dom/useEventListener'
import useInitialFetch from './composables/useInitialFetch'
import useMainViewLayout from './composables/useMainViewLayout'
import useRouteWatcher from './composables/useRouteWatcher'

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

const useCommandPaletteShortcutKey = () => {
  const { mode, openCommandPalette, closeCommandPalette } = useCommandPalette()

  const isSearchEnabled = window.traQConfig.enableSearch ?? false

  const onKeyDown = (e: KeyboardEvent) => {
    if (isSearchEnabled) {
      if (e.key.toLowerCase() === 'f' && e.shiftKey && e.ctrlKey) {
        e.preventDefault()

        if (mode.value === 'search') {
          closeCommandPalette()
        } else {
          openCommandPalette('search')
        }
        return
      }
      if (e.key === '/' && e.ctrlKey) {
        e.preventDefault()

        if (mode.value === 'search') {
          closeCommandPalette()
        } else {
          openCommandPalette('search', 'in:here ')
        }
        return
      }
    }
  }

  useEventListener(window, 'keydown', onKeyDown)
}

const NotFoundPage = defineAsyncComponent(
  () => import('/@/views/NotFoundPage.vue')
)
</script>

<script lang="ts" setup>
import CommandPaletteContainer from '/@/components/Main/CommandPalette/CommandPaletteContainer.vue'
import MainView from '/@/components/Main/MainView/MainView.vue'
import MainViewFrame from '/@/components/Main/MainView/MainViewFrame.vue'
import NavigationBar from '/@/components/Main/NavigationBar/NavigationBar.vue'

import useViewStateSender from './composables/useViewStateSender'

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
  isMainViewActive
} = useMainViewLayout(navWidth, sidebarWidth)
const { addToast } = useToastStore()

useCommandPaletteShortcutKey()

const { isMobile } = useResponsive()
const shouldShowNav = computed(() => !isMobile.value || isNavAppeared.value)
const { closeNav } = useNavigationController()
const hideOuter = computed(
  () => isMobile.value && isNavCompletelyAppeared.value
)

const { routeWatcherState, triggerRouteParamChange } = useRouteWatcher()
useInitialFetch(() => {
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

useViewStateSender()
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
  width: fit-content;
  [data-is-mobile] & {
    position: absolute;
    top: 0;
    left: 0;
    width: 320px;
  }
}
.mainViewWrapper {
  z-index: $z-index-main-view-wrapper;
  flex: 1;
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
  scrollbar-gutter: stable;
  contain: var(--contain-strict);
  z-index: $z-index-sidebar-wrapper;
}
.sidebarPortal {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}
.mainView {
  width: 100%;
  height: 100%;
}
</style>
