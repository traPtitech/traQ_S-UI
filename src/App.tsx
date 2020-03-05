import { createComponent } from '@vue/composition-api'
import { ThemeProvider } from 'vue-styled-components'
import HelloWorld from '@/components/HelloWorld'
import store from './store'

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
      <div id="app" data-is-mobile={store.getters.ui.isMobile}>
        <ThemeProvider theme={store.state.app.theme}>
          <HelloWorld msg="traQ" />
          <div id="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/login">Login</router-link>
          </div>
          <router-view />
        </ThemeProvider>
      </div>
    )
  }
})
