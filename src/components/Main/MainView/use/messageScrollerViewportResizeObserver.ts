import { Ref, reactive, onMounted } from '@vue/composition-api'

const useMessageScrollerViewportResizeObserver = (
  viewportRef: Ref<HTMLElement | null>
) => {
  const state = reactive({
    height: 0
  })
  const observer = new ResizeObserver(entries => {
    const entry = entries[0]
    const { height } = entry.target.getBoundingClientRect()
    state.height = height
  })
  onMounted(() => {
    if (viewportRef.value) {
      observer.observe(viewportRef.value)
      const { height } = viewportRef.value.getBoundingClientRect()
      state.height = height
    }
  })

  return { viewportState: state }
}

export default useMessageScrollerViewportResizeObserver
