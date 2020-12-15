import { computed } from 'vue'
import store from '@/_store'

const useIsMobile = () => {
  const isMobile = computed(() => store.state.ui.isMobile)
  return {
    isMobile
  }
}

export default useIsMobile
