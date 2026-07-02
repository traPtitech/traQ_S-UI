import { type ShallowRef, onMounted, onUnmounted, ref } from 'vue'

export const useGridLayout = (
  elementRef: ShallowRef<HTMLElement | null>,
  fallback?: {
    columnCount?: number
    rowCount?: number
  }
) => {
  const columnCount = ref<number>(fallback?.columnCount ?? NaN)
  const rowCount = ref<number>(fallback?.rowCount ?? NaN)

  let resizeObserver: ResizeObserver | null = null

  const updateLayout = () => {
    if (!elementRef.value) return

    const computedStyle = getComputedStyle(elementRef.value)

    rowCount.value = computedStyle
      .getPropertyValue('grid-template-rows')
      .split(' ')
      .filter(size => size !== '0px').length

    columnCount.value = computedStyle
      .getPropertyValue('grid-template-columns')
      .split(' ')
      .filter(size => size !== '0px').length
  }

  onMounted(() => {
    if (!elementRef.value) return

    resizeObserver = new ResizeObserver(() => {
      updateLayout()
    })

    resizeObserver.observe(elementRef.value)
    updateLayout()
  })

  onUnmounted(() => {
    if (!resizeObserver) return

    resizeObserver.disconnect()
    resizeObserver = null
  })

  return {
    columnCount,
    rowCount
  }
}

export default useGridLayout
