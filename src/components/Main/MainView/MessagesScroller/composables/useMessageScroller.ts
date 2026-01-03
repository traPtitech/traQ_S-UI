import type { Reactive, Ref } from 'vue'
import { reactive, watch } from 'vue'

import type { ChangeHeightData } from '/@/components/Main/MainView/MessageElement/composables/useElementRenderObserver'
import type { LoadingDirection } from '/@/components/Main/MainView/MessagesScroller/composables/useMessagesFetcher'
import { nextFrame } from '/@/lib/basic/timer'
import type { MessageId } from '/@/types/entity-ids'

const useMessageScroller = (
  rootRef: Ref<HTMLElement | null>,
  scrollerProps: Reactive<{
    messageIds: MessageId[]
    lastLoadingDirection: LoadingDirection
    entryMessageId?: MessageId
  }>
) => {
  const state = reactive({
    height: 0,
    scrollTop: 0
  })

  const onChangeHeight = async (payload: ChangeHeightData) => {
    if (!rootRef.value) return

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

      const scrollBottom = rootRef.value.scrollTop + rootRef.value.clientHeight

      // 末尾付近を閲覧しているときは，末尾を保つ
      if (state.height - scrollBottom <= 50) {
        if (!rootRef.value) return

        // 複数の onChangeHeight が同フレーム内に複数回呼ばれる場合があるので，
        // すべての更新を待ってからスクロールする
        await defer()
        rootRef.value.scrollTo({ top: rootRef.value.scrollHeight })
      }

      state.height = rootRef.value.scrollHeight
    }
  }

  const onEntryMessageLoaded = (relativePos: number) => {
    if (!rootRef.value) return

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
          rootRef.value.scrollTo({
            top: rootRef.value.scrollTop + newHeight - state.height
          })
          state.height = newHeight
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
