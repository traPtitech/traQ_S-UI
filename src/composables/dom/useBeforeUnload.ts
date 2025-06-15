import { onMounted, onUnmounted, type ComputedRef, type Ref } from 'vue'

export const useBeforeUnload = (
  isEnabled: Ref<boolean> | ComputedRef<boolean>,
  message: string,
  onBeforeUnload?: (event: BeforeUnloadEvent) => void
) => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!isEnabled.value) return
    onBeforeUnload?.(event)
    event.preventDefault()
    event.returnValue = message
    return message
  }
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
}
