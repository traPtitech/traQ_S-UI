import { ref } from 'vue'

import { mobileMinBreakpoint } from '/@/lib/media'
import createSharedComposable from '/@/lib/utils/createSharedComposable'

import useEventListener from './dom/useEventListener'

const useResponsive = () => {
  const isMobileQuery = matchMedia(`(max-width: ${mobileMinBreakpoint}px)`)
  const isHoverSupportedQuery = matchMedia('(hover: hover) and (pointer: fine)')

  const isMobile = ref(isMobileQuery.matches)
  const isTouchDevice = ref(!isHoverSupportedQuery.matches)

  const updateIsMobile = (event: MediaQueryListEvent) => {
    isMobile.value = event.matches
  }

  const updateIsTouchDevice = (event: MediaQueryListEvent) => {
    isTouchDevice.value = event.matches
  }

  useEventListener(isMobileQuery, 'change', updateIsMobile)
  useEventListener(isHoverSupportedQuery, 'change', updateIsTouchDevice)

  return { isMobile, isTouchDevice }
}

export default createSharedComposable(useResponsive)
