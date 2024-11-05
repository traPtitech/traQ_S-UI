<template>
  <not-found-page
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
      <navigation-bar
        v-show="shouldShowNav"
        :class="$style.navigationWrapper"
      />
      <main-view-frame
        v-if="routeWatcherState.view === 'main'"
        :is-active="isMainViewActive"
        :hide-outer="hideOuter"
        :dim-inner="isSidebarCompletelyAppeared"
        :class="$style.mainViewWrapper"
        :style="styles.mainViewWrapper"
        @click.capture="onClickMainViewFrame"
      >
        <main-view :class="$style.mainView" />
      </main-view-frame>
      <div
        v-show="isMobile && isSidebarAppeared"
        :class="$style.sidebarWrapper"
        :style="styles.sidebarWrapper"
      >
        <!-- モバイル時はスワイプ表示するためここにportal表示 -->
        <div id="sidebar-mobile" :class="$style.sidebarPortal" />
      </div>
    </div>
    <stamp-picker-container />
    <command-palette-container />
  </div>
</template>

<script lang="ts">
import type { Ref } from 'vue'
import {
  reactive,
  computed,
  defineAsyncComponent,
  onMounted,
  onBeforeUnmount
} from 'vue'
import { connectFirebase } from '/@/lib/notification/notification'
import { useResponsiveStore } from '/@/store/ui/responsive'
import useNavigationController from '/@/composables/mainView/useNavigationController'
import useMainViewLayout from './composables/useMainViewLayout'
import useRouteWatcher from './composables/useRouteWatcher'
import useInitialFetch from './composables/useInitialFetch'
import { useToastStore } from '/@/store/ui/toast'
import { useCommandPalette } from '/@/store/app/commandPalette'

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

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
  })
}

const NotFoundPage = defineAsyncComponent(
  () => import('/@/views/NotFoundPage.vue')
)
</script>

<script lang="ts" setup>
import MainView from '/@/components/Main/MainView/MainView.vue'
import MainViewFrame from '/@/components/Main/MainView/MainViewFrame.vue'
import NavigationBar from '/@/components/Main/NavigationBar/NavigationBar.vue'
import StampPickerContainer from '/@/components/Main/StampPicker/StampPickerContainer.vue'
import CommandPaletteContainer from '/@/components/Main/CommandPalette/CommandPaletteContainer.vue'
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
  isMainViewActive,
  currentActiveDrawer
} = useMainViewLayout(navWidth, sidebarWidth)
const { addToast } = useToastStore()

useCommandPaletteShortcutKey()

const { isMobile } = useResponsiveStore()
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
// ナビゲーションバーの幅
$min-nav-width: 260px;
$max-nav-width: 400px;
// ナビゲーションバーの幅が最小・最大になる画面幅
$min-nav-width-display-width: 700px;
$max-nav-width-display-width: 2560px;
// それぞれの差と二つの比率
$nav-width-diff: $max-nav-width - $min-nav-width;
$nav-width-display-width-diff: $max-nav-width-display-width -
  $min-nav-width-display-width;
$nav-width-ratio: math.div($nav-width-diff, $nav-width-display-width-diff);

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
  max-width: 400px;
  min-width: 260px;
  flex-shrink: 0;
  flex-basis: calc(
    260px + ((100vw - #{$min-nav-width-display-width}) * #{$nav-width-ratio})
  );
  [data-is-mobile] & {
    position: absolute;
    top: 0;
    left: 0;
    width: 320px;
  }
}
.mainViewWrapper {
  z-index: $z-index-main-view-wrapper;
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
  contain: strict;
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
