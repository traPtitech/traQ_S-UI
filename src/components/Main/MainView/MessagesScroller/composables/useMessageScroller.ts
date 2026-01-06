import type { Ref } from 'vue'
import { reactive } from 'vue'

import type { ChangeHeightData } from '/@/components/Main/MainView/MessageElement/composables/useElementRenderObserver'
import type { LoadingDirection } from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import type { MessageId } from '/@/types/entity-ids'

const useMessageScroller = (
  rootRef: Ref<HTMLElement | null>,
  scrollerProps: {
    messageIds: MessageId[]
    lastLoadingDirection: LoadingDirection
    entryMessageId?: MessageId
  }
) => {
  const state = reactive({
    height: 0,
    scrollTop: 0
  })

  const onChangeHeight = (payload: ChangeHeightData) => {
    if (!rootRef.value) {
      return
    }

    if (
      scrollerProps.lastLoadingDirection === 'around' &&
      scrollerProps.entryMessageId
    ) {
      // エントリーメッセージがあり、かつ初回ロードの場合
      // エントリーより上にあった場合はスクロール位置をずらす
      let isBeforeEntryMessage = false
      for (const messageId of scrollerProps.messageIds) {
        if (messageId === scrollerProps.entryMessageId) break
        if (messageId === payload.id) {
          isBeforeEntryMessage = true
          break
        }
      }

      if (isBeforeEntryMessage) {
        rootRef.value.scrollTo({
          top: rootRef.value.scrollTop + payload.heightDiff
        })
        state.height = rootRef.value.scrollHeight
      }
    } else if (
      scrollerProps.lastLoadingDirection === 'latest' ||
      scrollerProps.lastLoadingDirection === 'former'
    ) {
      const scrollerTop = rootRef.value.getBoundingClientRect().top
      // 視界より上にある要素の高さが変わった場合のみ補正する
      if (payload.top < scrollerTop) {
        rootRef.value.scrollTo({
          top: rootRef.value.scrollTop + payload.heightDiff
        })
      }
      state.height = rootRef.value.scrollHeight
    }
  }

  const onEntryMessageLoaded = (relativePos: number) => {
    if (!rootRef.value) {
      return
    }
    const rootHeight = rootRef.value.getBoundingClientRect().height
    rootRef.value.scrollTo({ top: relativePos - rootHeight / 3 })
  }

  const adjustScroll = () => {
    if (!rootRef.value) return

    const newHeight = rootRef.value.scrollHeight
    if (newHeight === state.height) return

    if (
      scrollerProps.lastLoadingDirection === 'latest' ||
      scrollerProps.lastLoadingDirection === 'former'
    ) {
      const { scrollTop, clientHeight } = rootRef.value
      const scrollBottom = scrollTop + clientHeight

      if (state.height - 50 <= scrollBottom) {
        rootRef.value.scrollTo({ top: newHeight })
      } else if (scrollerProps.lastLoadingDirection === 'former') {
        const heightDiff = newHeight - state.height
        rootRef.value.scrollTo({
          top: rootRef.value.scrollTop + heightDiff
        })
      }
    }

    state.height = newHeight
  }

  return {
    onChangeHeight,
    onEntryMessageLoaded,
    adjustScroll,
    state
  }
}

export default useMessageScroller
