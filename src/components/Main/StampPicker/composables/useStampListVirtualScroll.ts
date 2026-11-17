import type { CSSProperties, Ref, ShallowRef } from 'vue'
import { computed } from 'vue'

import { useElementSize } from '@vueuse/core'

import useScrollPosition from '/@/composables/dom/useScrollPosition'

/**
 * 構造としては
 *
 * - frame (スクロールする)
 *   - container (一覧全体の高さを確保する)
 *     - panel (frameに表示される部分だけ描画されてる)
 *
 * になっている
 */
const useStampListVirtualScroll = (
  targetRef: ShallowRef<HTMLElement | null>,
  cellSizeRef: ShallowRef<HTMLElement | null>,
  count: Ref<number>
) => {
  const { height, width } = useElementSize(targetRef)
  const { width: cellSize } = useElementSize(cellSizeRef)
  const { scrollTop, onScroll } = useScrollPosition(targetRef)

  /** 表示できる列の数 */
  const columns = computed(() =>
    cellSize.value ? Math.max(1, Math.floor(width.value / cellSize.value)) : 1
  )
  /** 表示できる行の数 */
  const visibleRows = computed(() =>
    cellSize.value ? Math.ceil(height.value / cellSize.value) + 1 : 0
  )

  /** スクロールできる高さ */
  const scrollHeight = computed(
    () => Math.ceil(count.value / columns.value) * cellSize.value
  )
  /** 表示されている部分よりも上の非表示になっている行の数 */
  const topHiddenRows = computed(() => {
    if (!cellSize.value) return 0

    const maxScrollTop = Math.max(0, scrollHeight.value - height.value)
    const clampedScrollTop = Math.min(
      Math.max(0, scrollTop.value),
      maxScrollTop
    )

    return Math.floor(clampedScrollTop / cellSize.value)
  })

  /** 表示されるものの最初のindex */
  const showStartIndex = computed(() => topHiddenRows.value * columns.value)
  /** 表示されるものの最後のindex+1 */
  const showEndIndex = computed(
    () => showStartIndex.value + visibleRows.value * columns.value
  )

  const containerStyle = computed(() => ({ height: `${scrollHeight.value}px` }))
  const panelStyle = computed<CSSProperties>(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns.value}, ${cellSize.value}px)`,
    transform: `translateY(${topHiddenRows.value * cellSize.value}px)`
  }))

  return {
    onScroll,
    showStartIndex,
    showEndIndex,
    containerStyle,
    panelStyle
  }
}

export default useStampListVirtualScroll
