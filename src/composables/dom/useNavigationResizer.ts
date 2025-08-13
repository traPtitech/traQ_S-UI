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

  const restoreWidth = () => {
    if (navigationWidth.value > 0) return
    restoreNavigationWidth()
  }

  const cleanup = () => {
    animationFrame.cancel()

    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  const onMouseDown = (e: MouseEvent) => {
    isResizing.value = true

    if (!isNavigationClosed.value) updateNavigationLeft()

    document.body.style.cursor = 'e-resize'
    document.body.style.userSelect = 'none'

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    e.preventDefault()
  }

  const onMouseMove = (e: MouseEvent) => {
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

  const onMouseUp = () => {
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
    startResizing: onMouseDown
  }
}
