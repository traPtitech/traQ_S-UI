import { Ref } from 'vue'
import { MessageId } from '/@/types/entity-ids'
import { LoadingDirection } from './useMessagesFetcher'
import { ChangeHeightData } from '/@/components/Main/MainView/MessageElement/composables/useElementRenderObserver'

const useMessageScrollerElementResizeObserver = (
  rootRef: Ref<HTMLElement | null>,
  scrollerProps: {
    messageIds: MessageId[]
    lastLoadingDirection: LoadingDirection
    entryMessageId?: MessageId
  },
  viewPortState: {
    height: number
  }
) => {
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
        rootRef.value.scrollTop += payload.heightDiff
        viewPortState.height = rootRef.value.scrollHeight
      }
    } else if (
      scrollerProps.lastLoadingDirection === 'latest' ||
      scrollerProps.lastLoadingDirection === 'former'
    ) {
      rootRef.value.scrollTop += payload.heightDiff
      viewPortState.height = rootRef.value.scrollHeight
    }
  }

  const onEntryMessageLoaded = (relativePos: number) => {
    if (!rootRef.value) {
      return
    }
    const rootHeight = rootRef.value.getBoundingClientRect().height
    rootRef.value.scrollTop = relativePos - rootHeight / 3
  }

  return { onChangeHeight, onEntryMessageLoaded }
}

export default useMessageScrollerElementResizeObserver
