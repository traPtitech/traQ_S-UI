import { onBeforeUnmount, onMounted, Ref } from 'vue'
import { useCommandPaletteStore } from '/@/providers/commandPalette'

const useKeepScrollPosition = (ele: Ref<HTMLElement | null>) => {
  const { commandPaletteStore: store, setCurrentScrollTop } =
    useCommandPaletteStore()

  // 開くときにスクロール位置を適用
  onMounted(() => {
    if (ele.value) {
      ele.value.scrollTop = store.searchState.currentScrollTop
    }
  })

  // 閉じるときにスクロール位置を保持
  onBeforeUnmount(() => {
    if (ele.value) {
      setCurrentScrollTop(ele.value.scrollTop)
    }
  })
}

export default useKeepScrollPosition
