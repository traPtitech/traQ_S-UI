import type { ShallowRef } from 'vue'
import { onBeforeUnmount, ref, watch } from 'vue'

const useBoxSize = (
  targetRef: ShallowRef<HTMLElement | null>,
  isBorderBox = true
) => {
  const height = ref<number>()
  const width = ref<number>()

  const observer = new ResizeObserver(entries => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = entries[0]!

    if (isBorderBox) {
      // borderBoxSizeはSafari 15.4+
      if (entry.borderBoxSize) {
        const box = entry.borderBoxSize[0]
        height.value = box?.blockSize ? Math.ceil(box?.blockSize) : undefined
        width.value = box?.inlineSize ? Math.ceil(box?.inlineSize) : undefined
      } else {
        const box = entry.target.getBoundingClientRect()
        height.value = Math.ceil(box.height)
        width.value = Math.ceil(box.width)
      }
    } else {
      // contentBoxSizeはSafari 15.4+
      if (entry.contentBoxSize) {
        const box = entry.contentBoxSize[0]
        height.value = box?.blockSize ? Math.ceil(box?.blockSize) : undefined
        width.value = box?.inlineSize ? Math.ceil(box?.inlineSize) : undefined
      } else {
        const box = entry.target.getClientRects()[0]
        height.value = box?.height ? Math.ceil(box?.height) : undefined
        width.value = box?.width ? Math.ceil(box?.width) : undefined
      }
    }
  })

  watch(
    targetRef,
    (after, before) => {
      if (before) {
        observer.unobserve(before)
      }
      if (after) {
        observer.observe(after)
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    observer.disconnect()
  })

  return { height, width }
}

export default useBoxSize
