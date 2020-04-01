import { ref } from '@vue/composition-api'

const useTextAreaSizeUpdater = () => {
  const shouldUpdateSize = ref(false)
  const onStampInput = () => {
    shouldUpdateSize.value = true
  }
  const onUpdateSize = () => {
    shouldUpdateSize.value = false
  }
  return { shouldUpdateSize, onUpdateSize, onStampInput }
}

export default useTextAreaSizeUpdater
