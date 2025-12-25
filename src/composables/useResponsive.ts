import { ref } from 'vue'

import { mobileMinBreakpoint } from '/@/lib/media'
import createSharedComposable from '/@/lib/utils/createSharedComposable'

import useEventListener from './dom/useEventListener'

const useResponsive = () => {
  const queryList = window.matchMedia(`(max-width: ${mobileMinBreakpoint}px)`)
  const isHoverSupported = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  )

  const isMobile = ref(queryList.matches)
  const isTouchDevice = ref(!isHoverSupported.matches)

  const updateIsMobile = (event: MediaQueryListEvent) => {
    isMobile.value = event.matches
  }

  const updateIsTouchDevice = (event: MediaQueryListEvent) => {
    isTouchDevice.value = event.matches
  }

  useEventListener(queryList, 'change', updateIsMobile)
  useEventListener(isHoverSupported, 'change', updateIsTouchDevice)

  return { isMobile, isTouchDevice }
}

export default createSharedComposable(useResponsive)
