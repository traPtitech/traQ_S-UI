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
  // safariではaddEventListener('change', func)が未対応なため
  queryList.addListener((event: MediaQueryListEvent) => {
    isMobile.value = event.matches
  })
  isHoverSupported.addListener((event: MediaQueryListEvent) => {
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
