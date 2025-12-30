import { computed, onUnmounted } from 'vue'

import { useWindowSize } from '@vueuse/core'

import useDragging from '/@/composables/dom/useDragging'
import { createAnimationFrameController } from '/@/lib/dom/animationFrame'
import {
  MAX_NAVIGATION_WIDTH_RATIO,
  MIN_NAVIGATION_WIDTH,
  NAVIGATION_CLOSING_THRESHOLD,
  useNavigationLayoutStore
} from '/@/store/ui/navigationLayout'

const useNavigationResizer = () => {
  const animationFrame = createAnimationFrameController()

  const { width: windowWidth } = useWindowSize({ initialWidth: Infinity })

  const {
    resizerRef,
    navigationWidth,
    isNavigationClosed,
    saveNavigationWidth,
    closeNavigation,
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

  const { isDragging, onDragStart, onDragging, onDragEnd } = useDragging({
    targetRef: resizerRef,
    onDragStart: () => {
      document.body.style.cursor = 'e-resize'
      document.body.style.userSelect = 'none'
      if (!isNavigationClosed.value) updateNavigationLeft()
    },
    onDragging: (e: PointerEvent) => {
      animationFrame.request(() => {
        const width = e.clientX - navigationLeft.value

        if (width <= NAVIGATION_CLOSING_THRESHOLD) {
          closeNavigation()
        } else {
          setNavigationWidth(width)
        }
      })
    },
    onDragEnd: () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      if (navigationWidth.value > 0) saveNavigationWidth()
    }
  })

  onUnmounted(() => {
    animationFrame.cancel()
  })

  return {
    isNavigationResizing: isDragging,
    navigationWidth: clampedNavigationWidth,
    onDragStart,
    onDragging,
    onDragEnd
  }
}

export default useNavigationResizer
