import { createComponent } from '@vue/composition-api'
import NavigationContent from '@/components/Main/Navigation/NavigationContent'
import NavigationSelector from '@/components/Main/Navigation/NavigationSelector'

export default createComponent({
  name: 'Navigation',
  setup() {
    return () => (
      <div class="navigation">
        <NavigationSelector />
        <NavigationContent />
      </div>
    )
  }
})
