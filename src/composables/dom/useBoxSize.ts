import { onBeforeUnmount, ref, ShallowRef, watch } from 'vue'

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
        height.value = box?.blockSize
        width.value = box?.inlineSize
      } else {
        const box = entry.target.getBoundingClientRect()
        height.value = box.height
        width.value = box.width
      }
    } else {
      // contentBoxSizeはSafari 15.4+
      if (entry.contentBoxSize) {
        const box = entry.contentBoxSize[0]
        height.value = box?.blockSize
        width.value = box?.inlineSize
      } else {
        const box = entry.target.getClientRects()[0]
        height.value = box?.height
        width.value = box?.width
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
