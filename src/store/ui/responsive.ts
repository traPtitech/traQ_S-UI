import { ref, effectScope, readonly } from 'vue'
import { mobileMinBreakpoint } from '/@/lib/media'

const scope = effectScope()

const responsiveState = scope.run(() => {
  const queryList = window.matchMedia(`(max-width: ${mobileMinBreakpoint}px)`)
  const isHoverSupported = window.matchMedia(
    '(hover: hover) and (pointer: fine)'
  )

  const isMobile = ref(queryList.matches)
  const isTouchDevice = ref(!isHoverSupported.matches)

  queryList.addEventListener('change', (event: MediaQueryListEvent) => {
    isMobile.value = event.matches
  })
  isHoverSupported.addEventListener('change', (event: MediaQueryListEvent) => {
    isTouchDevice.value = !event.matches
  })

  return { isMobile, isTouchDevice }
})

if (!responsiveState) {
  throw new Error('Failed to initialize responsive state')
}

const { isMobile, isTouchDevice } = responsiveState

export const useResponsiveStore = () => ({
  isMobile: readonly(isMobile),
  isTouchDevice: readonly(isTouchDevice)
})
