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
            accent: {
              primary: '#005BAC',
              notification: '#F2994A',
              online: '#28F0E4'
            },
            background: {
              primary: '#FFFFFF',
              secondary: '#F6F7F9',
              tertiary: '#ECEFF3'
            },
            ui: {
              primary: '#525E67',
              secondary: '#828E96',
              tertiary: '#ECEFF3'
            },
            text: {
              primary: '#333333',
              secondary: '#79797A'
            }
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
