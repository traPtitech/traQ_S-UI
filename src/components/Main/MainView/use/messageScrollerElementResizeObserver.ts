import { Ref, reactive, onMounted, ref } from '@vue/composition-api'

const useMessageScrollerElementResizeObserver = (
  rootRef: Ref<HTMLElement | null>,
  scrollerState: { height: number }
) => {
  const heightChangeCount = ref(0)
  const isRendering = ref(false)

  const onChangeHeight = (payload: {
    heightDiff: number
    top: number
    bottom: number
    lastTop: number
    lastBottom: number
  }) => {
    if (!rootRef.value) {
      return
    }
    const {
      height: rootHeight,
      bottom: rootBottom,
      top: rootTop
    } = rootRef.value.getBoundingClientRect()
    const clientCenterPos = (rootTop + rootBottom) / 2

    if (payload.lastBottom < clientCenterPos) {
      rootRef.value.scrollTop = rootRef.value.scrollTop + payload.heightDiff
      scrollerState.height += payload.heightDiff
    }
  }

  const onEntryMessageLoaded = (relativePos: number) => {
    if (!rootRef.value) {
      return
    }
    const rootHeight = rootRef.value.getBoundingClientRect().height
    rootRef.value.scrollTop = relativePos - rootHeight / 3
  }
  const onObserverRegister = (isEntry: boolean) => {}
  const resetObserverRegistration = (isEntry: boolean) => {}

  return { onChangeHeight, onObserverRegister, onEntryMessageLoaded }
}

export default useMessageScrollerElementResizeObserver
