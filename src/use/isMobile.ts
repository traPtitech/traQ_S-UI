import { computed } from 'vue'
import store from '/@/vuex'

const useIsMobile = () => {
  const isMobile = computed(() => store.state.ui.isMobile)
  return { isMobile }
}

export default useIsMobile
