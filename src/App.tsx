import { createComponent } from '@vue/composition-api'
import { ThemeProvider } from 'vue-styled-components'
import HelloWorld from '@/components/HelloWorld'

export default createComponent({
  name: 'App',
  setup() {
    return () => (
      <div id="app">
        <ThemeProvider
          theme={{
            primary: '#005BAC'
          }}
        >
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
