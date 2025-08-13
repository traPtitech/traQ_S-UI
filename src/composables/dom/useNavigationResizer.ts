import { ref, onUnmounted, computed } from 'vue'
import {
  useNavigationLayoutStore,
  MIN_NAVIGATION_WIDTH,
  MAX_NAVIGATION_WIDTH_RATIO,
  NAVIGATION_CLOSING_THRESHOLD
} from '/@/store/ui/navigationLayout'
import { createAnimationFrameController } from '/@/lib/dom/animationFrame'
import useInnerWindowSize from './useInnerWindowSize'

export const useNavigationResizer = () => {
  const animationFrame = createAnimationFrameController()

  const { width: windowWidth } = useInnerWindowSize({ width: Infinity })

  const {
    resizerRef,
    navigationWidth,
    isNavigationClosed,
    saveNavigationWidth,
    restoreNavigationWidth,
    navigationLeft,
    updateNavigationLeft
  } = useNavigationLayoutStore()

  const clampWidth = (width: number) => {
    return Math.min(
      Math.max(width, MIN_NAVIGATION_WIDTH),
      windowWidth.value * MAX_NAVIGATION_WIDTH_RATIO
    )
  }

  const setNavigationWidth = (width: number) => {
    navigationWidth.value = clampWidth(width)
  }

  const clampedNavigationWidth = computed(() => {
    return clampWidth(navigationWidth.value)
  })

  const isResizing = ref(false)
  let pointerId: null | number = null

  const restoreWidth = () => {
    if (navigationWidth.value > 0) return
    restoreNavigationWidth()
  }

  const cleanup = () => {
    animationFrame.cancel()

    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    if (!pointerId || !resizerRef.value?.hasPointerCapture(pointerId)) return
    resizerRef.value?.releasePointerCapture(pointerId)
  }

  const onDragStart = (e: PointerEvent) => {
    isResizing.value = true

    if (!isNavigationClosed.value) updateNavigationLeft()

    document.body.style.cursor = 'e-resize'
    document.body.style.userSelect = 'none'

    pointerId = e.pointerId
    resizerRef.value?.setPointerCapture(pointerId)

    e.preventDefault()
  }

  const onDragging = (e: PointerEvent) => {
    if (!isResizing.value) return

    animationFrame.request(() => {
      const width = e.clientX - navigationLeft.value

      if (width <= NAVIGATION_CLOSING_THRESHOLD) {
        navigationWidth.value = 0
      } else {
        setNavigationWidth(width)
      }
    })

    e.preventDefault()
  }

  const onDragEnd = () => {
    if (!isResizing.value) return

    if (navigationWidth.value > 0) saveNavigationWidth()

    isResizing.value = false
    cleanup()
  }

  onUnmounted(cleanup)

  return {
    isNavigationResizing: isResizing,
    isNavigationClosed,
    navigationWidth: clampedNavigationWidth,
    restoreNavigationWidth: restoreWidth,
    onDragStart,
    onDragging,
    onDragEnd
  }
}
