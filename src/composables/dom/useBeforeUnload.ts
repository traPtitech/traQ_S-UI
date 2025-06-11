import { onMounted, onUnmounted, type ComputedRef, type Ref } from 'vue'

export const useBeforeUnload = (
  enabled: Ref<boolean> | ComputedRef<boolean>,
  message: string
) => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!enabled.value) return
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
