import { Ref, watchEffect, watch } from 'vue'
import { ExternalUrl, FileId } from '/@/types/entity-ids'
import { Message } from '@traptitech/traq'
import { useRoute } from 'vue-router'

export type ChangeHeightData = Readonly<{
  heightDiff: number
  top: number
  bottom: number
  lastTop: number
  lastBottom: number
  date?: string
}>

const useElementRenderObserver = (
  bodyRef: Ref<HTMLDivElement | null>,
  props: { isEntryMessage: boolean },
  state: Readonly<{
    content: string
    message?: Message
  }>,
  embeddingsState: Readonly<{
    fileIds: readonly FileId[]
    externalUrls: readonly ExternalUrl[]
  }>,
  emit: ((name: 'entry-message-loaded', relativePos: number) => void) &
    ((name: 'change-height', data: ChangeHeightData) => void)
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
      if (bodyRef.value && props.isEntryMessage) {
        const parentTop =
          bodyRef.value.parentElement?.getBoundingClientRect().top ?? 0
        const { top } = bodyRef.value.getBoundingClientRect()
        emit('entry-message-loaded', top - parentTop)
      }
    } else {
      emit('change-height', {
        heightDiff: height - lastHeight,
        top,
        bottom,
        lastTop,
        lastBottom,
        date: state.message?.createdAt
      })
    }
    lastHeight = height
    lastBottom = bottom
    lastTop = top
  })
  const stop = watchEffect(
    async () => {
      if (
        (props.isEntryMessage ||
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
