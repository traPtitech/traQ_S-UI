import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { mobileMinBreakpoint } from '/@/lib/media'
import { convertToRefsStore } from '/@/store/utils/convertToRefsStore'

const useResponsiveStorePinia = defineStore('ui/responsive', () => {
  const queryList = window.matchMedia(`(max-width: ${mobileMinBreakpoint}px)`)

  const isMobile = ref(queryList.matches)

  // safariではaddEventListener('change', func)が未対応なため
  queryList.addListener((event: MediaQueryListEvent) => {
    isMobile.value = event.matches
  })

  return { isMobile }
})

export const useResponsiveStore = convertToRefsStore(useResponsiveStorePinia)

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useResponsiveStorePinia, import.meta.hot)
  )
}
