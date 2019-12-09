import { createComponent } from '@vue/composition-api'
import HelloWorld from '@/components/HelloWorld'

export default createComponent({
  name: 'App',
  setup() {
    return () => (
      <div id="app">
        <HelloWorld msg="hoge" />
        <div id="nav">
          <router-link to="/">Home</router-link> |
          <router-link to="/about">About</router-link>
        </div>
        <router-view />
      </div>
    )
  }
})
