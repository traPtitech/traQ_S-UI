<template>
  <div
    class="touch-detector"
    @touchstart="touchstartHandler"
    @touchmove="touchmoveHandler"
    @touchend="touchendHandler"
  >
    <div :class="$style['home-container']">
      <div :class="$style['navigation-wrapper']">
        <Navigation />
      </div>
      <div :class="$style['main-view-wrapper']" :style="mainViewWrapperStyle">
        <MainViewController :isActive="isNavAppeared" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { createComponent, computed } from '@vue/composition-api'
import MainViewController from '@/components/Main/MainView/MainViewController'
import Navigation from '@/components/Main/Navigation/Navigation'
import styled from 'vue-styled-components'
import store from '@/store'
import { useSwipeDetector } from '@/compositions/swipeDetector'
import { useSwipeDrawer } from '@/compositions/swipeDrawer'

export default createComponent({
  name: 'Home',
  components: {
    Navigation,
    MainViewController
  },
  setup() {
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

    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,

      isNavAppeared: isAppeared,

      mainViewWrapperStyle
    }
  }
})
</script>

<style lang="scss" module>
.navigation-wrapper {
  flex-grow: 0;
  flex-shrink: 0;
  [data-is-mobile] & {
    position: absolute;
    top: 0;
    left: 0;
  }
}
.home-container {
  display: flex;
  [data-is-mobile] & {
    position: relative;
  }
}
.main-view-wrapper {
  width: 100%;
}
</style>
