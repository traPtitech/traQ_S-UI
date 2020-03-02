import { createComponent } from '@vue/composition-api'
import MainViewController from '@/components/Main/MainView/MainViewController'
import Navigation from '@/components/Main/Navigation/Navigation'

export default createComponent({
  name: 'Home',
  setup() {
    return () => (
      <div class="home">
        <Navigation></Navigation>
        <MainViewController></MainViewController>
      </div>
    )
  }
})
