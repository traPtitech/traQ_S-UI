import type { Ref } from 'vue'
import { unref, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import type { ExternalUrl, FileId, MessageId } from '/@/types/entity-ids'

export type ChangeHeightData = Readonly<{
  id: MessageId
  heightDiff: number
  top: number
  bottom: number
  lastTop: number
  lastBottom: number
}>

const useElementRenderObserver = (
  bodyRef: Ref<HTMLDivElement | null>,
  isEntryMessage: Ref<boolean> | boolean,
  messageId: Ref<string>,
  embeddingsState: Readonly<{
    quoteMessageIds: readonly MessageId[]
    fileIds: readonly FileId[]
    externalUrls: readonly ExternalUrl[]
    hasCodeBlock: boolean
  }>,
  emit: ((name: 'entryMessageLoaded', relativePos: number) => void) &
    ((name: 'changeHeight', data: ChangeHeightData) => void)
) => {
  const route = useRoute()

  type State = {
    height: number
    bottom: number
    top: number
  }

  let prevState: State | null = null

  const resizeObserver = new ResizeObserver(entries => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = entries[0]!
    const { height, bottom, top } = entry.target.getBoundingClientRect()

    if (prevState === null) {
      // 初回に高さが変化した場合、初期レンダリング完了とみなす
      // これ以降新規にobserveしないためにwatcherを止める
      stop()

      // エントリーメッセージだった場合は高さを報告する
      if (bodyRef.value && unref(isEntryMessage)) {
        const parentTop =
          bodyRef.value.parentElement?.parentElement?.getBoundingClientRect()
            .top ?? 0
        const { top } = bodyRef.value.getBoundingClientRect()
        emit('entryMessageLoaded', top - parentTop)
      }
    } else {
      emit('changeHeight', {
        id: messageId.value,
        heightDiff: height - prevState.height,
        top,
        bottom,
        lastTop: prevState.top,
        lastBottom: prevState.bottom
      })
    }

    prevState = { height, bottom, top }
  })

  const stop = watchEffect(
    () => {
      if (
        (unref(isEntryMessage) ||
          embeddingsState.quoteMessageIds.length > 0 ||
          embeddingsState.fileIds.length > 0 ||
          embeddingsState.externalUrls.length > 0 ||
          embeddingsState.hasCodeBlock) &&
        bodyRef.value
      ) {
        /*
          引用 / 添付ファイル / 外部URL / コードブロック がある場合か
          エントリーメッセージは
          高さ監視をする
        */
        resizeObserver.observe(bodyRef.value, { box: 'border-box' })
      }
    },
    // 監視前に高さが変わってしまうのを防止するためにsyncを指定する
    { flush: 'sync' }
  )

  watch(
    () => route.path,
    () =>
      // パス変更でunobserve
      // vue-routerのインスタンス再利用対策
      bodyRef.value ? resizeObserver.unobserve(bodyRef.value) : undefined
  )
}

export default useElementRenderObserver
