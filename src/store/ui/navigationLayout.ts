import { defineStore, acceptHMRUpdate } from 'pinia'
import { onMounted, ref } from 'vue'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'
import useIndexedDbValue from '/@/composables/utils/useIndexedDbValue'

type State = {
  navigationWidth: number
}

const useNavigationLayoutStorePinia = defineStore('ui/navigationLayout', () => {
  const initialValue: State = {
    navigationWidth: 260
  }

  const [state, _restoring, restoringPromise] = useIndexedDbValue(
    'store/ui/navigationLayout',
    1,
    {},
    initialValue
  )

  const navigationWidth = ref(initialValue.navigationWidth)

  const saveNavigationWidth = () => {
    state.navigationWidth = navigationWidth.value
  }

  const restoreNavigationWidth = () => {
    navigationWidth.value = state.navigationWidth
  }

  onMounted(() => {
    restoringPromise.value.then(restoreNavigationWidth)
  })

  return {
    navigationWidth,
    saveNavigationWidth,
    restoreNavigationWidth
  }
})

export const useNavigationLayoutStore = convertToRefsStore(
  useNavigationLayoutStorePinia
)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useNavigationLayoutStorePinia, import.meta.hot)
  )
}
