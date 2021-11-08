import { onBeforeUnmount, Ref } from 'vue'
import { useCommandPaletteStore } from '/@/providers/commandPalette'

const useStoreScrollPosition = (ele: Ref<HTMLElement | null>) => {
  const { commandPaletteStore: store, setCurrentScrollTop } =
    useCommandPaletteStore()

  const restoreScrollPosition = () => {
    if (ele.value) {
      ele.value.scrollTop = store.searchState.currentScrollTop
    }
  }

  const storeScrollPositionBeforeUnmount = () => {
    onBeforeUnmount(() => {
      if (ele.value) {
        setCurrentScrollTop(ele.value.scrollTop)
      }
    })
  }

  return {
    restoreScrollPosition,
    storeScrollPositionBeforeUnmount
  }
}

export default useStoreScrollPosition
