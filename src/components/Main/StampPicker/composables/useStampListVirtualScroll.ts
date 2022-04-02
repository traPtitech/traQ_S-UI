import type { ShallowRef, Ref } from 'vue'
import { computed } from 'vue'
import useBoxSize from '/@/composables/dom/useBoxSize'
import useScrollPosition from '/@/composables/dom/useScrollPosition'
import useThrottled from '/@/composables/utils/useThrottled'

const stampHeight = 32
const stampWidth = 32

/**
 * 構造としては
 *
 * - frame (スクロールしない)
 *   - container (スクロールする、描画はしない)
 *     - panel (frameに表示される部分だけ描画されてる)
 *
 * になっている
 */
const useStampListVirtualScroll = (
  targetRef: ShallowRef<HTMLElement | null>,
  count: Ref<number>
) => {
  const { height, width } = useBoxSize(targetRef, false)
  const { scrollTop, onScroll } = useScrollPosition(targetRef)

  /** 表示できる列の数 */
  const columns = computed(() => Math.floor((width.value ?? 0) / stampWidth))
  /** 表示できる行の数 */
  const visibleRows = computed(
    () => Math.ceil((height.value ?? 0) / stampHeight) + 1
  )

  /** スクロールできる高さ */
  const scrollHeight = computed(
    () => Math.ceil(count.value / columns.value) * stampHeight
  )
  /** 表示されている部分よりも上の非表示になっている行の数 */
  const topHiddenRows = useThrottled(
    computed(() => Math.max(0, Math.floor(scrollTop.value / stampHeight)))
  )

  /** 表示されるものの最初のindex */
  const showStartIndex = computed(() => topHiddenRows.value * columns.value)
  /** 表示されるものの最後のindex+1 */
  const showEndIndex = computed(
    () => showStartIndex.value + visibleRows.value * columns.value
  )

  const transformTranslateY = computed(() =>
    Math.max(
      Math.min(
        topHiddenRows.value * 32,
        scrollHeight.value - (height?.value ?? 0)
      ),
      0
    )
  )

  const containerStyle = computed(() => ({ height: `${scrollHeight.value}px` }))
  const panelStyle = computed(() => ({
    transform: `translateY(${transformTranslateY.value}px)`
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
