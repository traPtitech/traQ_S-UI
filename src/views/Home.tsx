import { createComponent } from '@vue/composition-api'
import HelloWorld from '@/components/HelloWorld'
import Logo from '@/assets/logo.png'

export default createComponent({
  name: 'Home',
  setup() {
    return () => (
      <div class="home">
        <img alt="Vue logo" src={Logo} />
        <HelloWorld msg="Welcome to Your Vue.js App" />
      </div>
    )
  }
})
