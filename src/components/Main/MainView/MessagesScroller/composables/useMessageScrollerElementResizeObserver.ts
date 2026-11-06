import type { Ref } from 'vue'

import type { ChangeHeightData } from '/@/components/Main/MainView/MessageElement/composables/useElementRenderObserver'
import type { PageLoadKind } from '/@/composables/utils/usePagedList'
import type { MessageId } from '/@/types/entity-ids'

const useMessageScrollerElementResizeObserver = (
  rootRef: Ref<HTMLElement | null>,
  scrollerProps: {
    messageIds: MessageId[]
    lastLoadKind: PageLoadKind
    entryMessageId?: MessageId
  },
  viewPortState: {
    height: number
    skipResizeAdjustment?: boolean
  }
) => {
  const onChangeHeight = (payload: ChangeHeightData) => {
    if (!rootRef.value) {
      return
    }

    if (
      scrollerProps.lastLoadKind === 'around' &&
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
      scrollerProps.lastLoadKind === 'latest' ||
      scrollerProps.lastLoadKind === 'previous'
    ) {
      // 古いメッセージを読み込んですぐはここで高さの調整をしない
      if (viewPortState.skipResizeAdjustment) {
        return
      }
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
