import { computed } from '@vue/composition-api'
import store from '@/store'

const useHeaderColor = () => {
  const headerStyle = computed(() => store.getters.ui.mainView.headerStyle)
  return { headerStyle }
}

export default useHeaderColor
