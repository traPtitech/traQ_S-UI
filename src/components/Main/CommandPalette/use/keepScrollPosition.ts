import { onBeforeUnmount, onMounted, Ref } from 'vue'
import { useCommandPalette } from '/@/store/app/commandPalette'

const useKeepScrollPosition = (ele: Ref<HTMLElement | null>) => {
  const { currentScrollTop } = useCommandPalette()

  // 開くときにスクロール位置を適用
  onMounted(() => {
    if (ele.value) {
      ele.value.scrollTop = currentScrollTop.value
    }
  })

  // 閉じるときにスクロール位置を保持
  onBeforeUnmount(() => {
    if (ele.value) {
      currentScrollTop.value = ele.value.scrollTop
    }
  })
}

export default useKeepScrollPosition
