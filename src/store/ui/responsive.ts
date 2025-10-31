import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { mobileMinBreakpoint } from '/@/lib/media'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

const useResponsiveStorePinia = defineStore('ui/responsive', () => {
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
    isTouchDevice.value = event.matches
  })

  return { isMobile, isTouchDevice }
})

export const useResponsiveStore = convertToRefsStore(useResponsiveStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useResponsiveStorePinia, import.meta.hot)
  )
}
