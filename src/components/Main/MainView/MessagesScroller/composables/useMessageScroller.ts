import type { Ref } from 'vue'
import { reactive, watch } from 'vue'

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
    scrollTop: 0,
    skipResizeAdjustment: false
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
      // 古いメッセージを読み込んですぐはここで高さの調整をしない
      if (state.skipResizeAdjustment) {
        return
      }

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

  watch(
    () => scrollerProps.messageIds,
    (ids, prevIds) => {
      if (!rootRef.value) return
      /* state.height の更新を忘れないようにすること */

      const newHeight = rootRef.value.scrollHeight
      if (
        scrollerProps.lastLoadingDirection === 'latest' ||
        scrollerProps.lastLoadingDirection === 'former'
      ) {
        if (ids.length - prevIds.length === -1) {
          // 削除された場合は何もしない
          state.height = newHeight
          return
        }
        // XXX: 追加時にここは0になる
        if (ids.length - prevIds.length === 0) {
          const scrollBottom =
            rootRef.value.scrollTop + rootRef.value.clientHeight

          // 一番下のメッセージあたりを見ているときに、
          // 新規に一つ追加された場合は一番下までスクロール
          if (state.height - 50 <= scrollBottom) {
            rootRef.value.scrollTo({ top: newHeight })
          }
          state.height = newHeight
          return
        }
        //上に追加された時はスクロール位置を変更する。
        if (scrollerProps.lastLoadingDirection === 'former') {
          // onChangeHeight の調整を一時的に無効化
          state.skipResizeAdjustment = true
          rootRef.value.scrollTo({
            top: rootRef.value.scrollTop + (newHeight - state.height)
          })
          state.height = newHeight
          // 十分に DOMが更新されたら無効化を解除
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              state.skipResizeAdjustment = false
            })
          })
        }

        if (scrollerProps.lastLoadingDirection === 'latest') {
          // チャンネルを移動したとき、
          rootRef.value.scrollTo({
            top: newHeight
          })
          state.height = newHeight
        }
      } else state.height = newHeight
    },
    { deep: true, flush: 'post' }
  )

  return {
    onChangeHeight,
    onEntryMessageLoaded,
    state
  }
}

export default useMessageScroller
