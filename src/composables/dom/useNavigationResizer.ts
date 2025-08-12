import { ref, onUnmounted, computed } from 'vue'
import { useNavigationLayoutStore } from '/@/store/ui/navigationLayout'
import { createAnimationFrameController } from '/@/lib/dom/animationFrame'
import useInnerWindowSize from './useInnerWindowSize'

export const useNavigationResizer = () => {
  const MIN_NAVIGATION_WIDTH = 200
  const MAX_NAVIGATION_WIDTH_RATIO = 0.5
  const NAVIGATION_CLOSING_RATIO = 0.5

  const animationFrame = createAnimationFrameController()

  const { width: innerWidth } = useInnerWindowSize()

  const { navigationWidth, saveNavigationWidth, restoreNavigationWidth } =
    useNavigationLayoutStore()

  const clampWidth = (width: number) => {
    return Math.min(
      Math.max(width, MIN_NAVIGATION_WIDTH),
      innerWidth.value * MAX_NAVIGATION_WIDTH_RATIO
    )
  }

  const setNavigationWidth = (width: number) => {
    navigationWidth.value = clampWidth(width)
  }

  const clampedNavigationWidth = computed(() => {
    return clampWidth(navigationWidth.value)
  })

  const isResizing = ref(false)
  let startX: number = 0
  let startWidth: number = 0

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
    startX = e.clientX
    startWidth = clampedNavigationWidth.value

    document.body.style.cursor = 'e-resize'
    document.body.style.userSelect = 'none'

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    e.preventDefault()
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return

    animationFrame.request(() => {
      const deltaX = e.clientX - startX
      const newWidth = startWidth + deltaX

      if (e.clientX <= MIN_NAVIGATION_WIDTH * NAVIGATION_CLOSING_RATIO) {
        navigationWidth.value = 0
      } else {
        setNavigationWidth(newWidth)
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
    navigationWidth: clampedNavigationWidth,
    restoreNavigationWidth: restoreWidth,
    startResizing: onMouseDown
  }
}
