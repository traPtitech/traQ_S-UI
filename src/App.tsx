import { createComponent } from '@vue/composition-api'
import { ThemeProvider } from 'vue-styled-components'
import store from './store'
import styled from 'vue-styled-components'
import '@/styles/reset.css'

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

export default createComponent({
  name: 'App',
  setup() {
    useWindowResizeObserver()
    return () => (
      <AppWrapper id="app" data-is-mobile={store.getters.ui.isMobile}>
        <ThemeProvider theme={store.state.app.theme}>
          <router-view />
        </ThemeProvider>
      </AppWrapper>
    )
  }
})

const AppWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
`
