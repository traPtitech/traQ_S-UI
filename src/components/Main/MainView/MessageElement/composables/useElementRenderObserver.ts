import type { Ref } from 'vue'
import { watchEffect, watch, unref } from 'vue'
import type { ExternalUrl, FileId, MessageId } from '/@/types/entity-ids'
import { useRoute } from 'vue-router'

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
    fileIds: readonly FileId[]
    externalUrls: readonly ExternalUrl[]
  }>,
  emit: ((name: 'entryMessageLoaded', relativePos: number) => void) &
    ((name: 'changeHeight', data: ChangeHeightData) => void)
) => {
  const route = useRoute()

  let lastHeight = 0
  let lastBottom = 0
  let lastTop = 0
  const resizeObserver = new ResizeObserver(entries => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = entries[0]!
    const { height, bottom, top } = entry.target.getBoundingClientRect()
    if (lastHeight === 0) {
      // 初回に高さが変化した場合、初期レンダリング完了とみなす
      // これ以降新規にobserveしないためにwatcherを止める
      stop()

      // エントリーメッセージだった場合は高さを報告する
      if (bodyRef.value && unref(isEntryMessage)) {
        const parentTop =
          bodyRef.value.parentElement?.getBoundingClientRect().top ?? 0
        const { top } = bodyRef.value.getBoundingClientRect()
        emit('entryMessageLoaded', top - parentTop)
      }
    } else {
      emit('changeHeight', {
        id: messageId.value,
        heightDiff: height - lastHeight,
        top,
        bottom,
        lastTop,
        lastBottom
      })
    }
    lastHeight = height
    lastBottom = bottom
    lastTop = top
  })
  const stop = watchEffect(
    () => {
      if (
        (unref(isEntryMessage) ||
          embeddingsState.fileIds.length > 0 ||
          embeddingsState.externalUrls.length > 0) &&
        bodyRef.value
      ) {
        /*
          添付ファイル/外部URLがある場合か
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
