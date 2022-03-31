import { onUnmounted, ref, Ref, watchEffect } from 'vue'

const useObjectURL = (blob: Ref<Blob | undefined>) => {
  const url = ref<string>()

  const cleanup = () => {
    if (url.value !== undefined) {
      URL.revokeObjectURL(url.value)
    }
  }

  watchEffect(() => {
    cleanup()

    if (!blob.value) {
      url.value = undefined
      return
    }

    url.value = URL.createObjectURL(blob.value)
  })

  onUnmounted(cleanup)

  return url
}

export default useObjectURL
