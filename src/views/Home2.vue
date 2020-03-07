<template>
  <MainContainer
    :class="{
      mobile: isMobile,
      desktop: !isMobile
    }"
  >
    <div
      class="touch-detector"
      :onTouchstart="touchstartHandler"
      :onTouchmove="touchmoveHandler"
      :onTouchend="touchendHandler"
    >
      <NavigationWrapper :width="320">
        <Navigation />
      </NavigationWrapper>
      <div
        class="main-view-wrapper"
        :style="{
          transform: `translateX(${swipeDrawerState.currentPosition}px)`
        }"
      >
        <MainViewController isActive="{!isNavAppeared.value}" />
      </div>
    </div>
  </MainContainer>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'
import MainViewController from '@/components/Main/MainView/MainViewController'
import Navigation from '@/components/Main/Navigation/Navigation'
import styled from 'vue-styled-components'
import store from '@/store'
import { useSwipeDetector } from '@/compositions/swipeDetector'
import { useSwipeDrawer } from '@/compositions/swipeDrawer'

const MainContainer = styled.div`
  &.desktop {
    display: flex;
  }
  &.mobile {
    position: relative;
  }
`

const NavigationWrapper = styled('div', { width: Number })`
  width: ${props => props.width.toString()}px;
  .mobile & {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
`

export default createComponent({
  name: 'Home',
  components: {
    Navigation,
    MainViewController,
    MainContainer,
    NavigationWrapper
  },
  setup() {
    const {
      swipeDetectorState,
      touchmoveHandler,
      touchstartHandler,
      touchendHandler
    } = useSwipeDetector()
    const { swipeDrawerState, isNavAppeared } = useSwipeDrawer(
      swipeDetectorState,
      'right',
      320,
      100,
      100
    )
    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,
      swipeDrawerState,
      isMobile: store.getters.ui.isMobile
    }
  }
})
</script>
