import { createComponent } from '@vue/composition-api'
import MainViewController from '@/components/Main/MainView/MainViewController'
import Navigation from '@/components/Main/Navigation/Navigation'
import styled from 'vue-styled-components'
import store from '@/store'
import { useSwipeDetector } from '@/compositions/swipeDetector'
import { useSwipeDrawer } from '@/compositions/swipeDrawer'

export default createComponent({
  name: 'Home',
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
    return () => (
      <MainContainer class={store.getters.ui.isMobile ? 'mobile' : 'desktop'}>
        <div
          class="touch-detector"
          onTouchstart={touchstartHandler}
          onTouchmove={touchmoveHandler}
          onTouchend={touchendHandler}>
          <div
            class="touch-detector-inner"
            style={{
              pointerEvents: swipeDetectorState.isSwiping ? 'none' : 'auto'
            }}>
            <NavigationWrapper width={320}>
              <Navigation />
            </NavigationWrapper>
            <div
              class="main-view-wrapper"
              style={{
                width: `100%`,
                transform: `translateX(${swipeDrawerState.currentPosition}px)`
              }}>
              <MainViewController isActive={!isNavAppeared.value} />
            </div>
          </div>
        </div>
      </MainContainer>
    )
  }
})

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
  }
`
