import { SetupContext, Ref, watchEffect, watch } from '@vue/composition-api'
import { FileId } from '@/types/entity-ids'

const useElementRenderObserver = (
  bodyRef: Ref<HTMLDivElement | null>,
  props: { isEntryMessage: boolean },
  state: {
    readonly content: string
    readonly fileIds: Readonly<FileId[]>
  },
  context: SetupContext
) => {
  let lastHeight = 0
  let lastBottom = 0
  let lastTop = 0
  const resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0]
    const { height, bottom, top } = entry.target.getBoundingClientRect()
    if (lastHeight === 0) {
      // 初回に高さが変化した場合、初期レンダリング完了とみなして処理を飛ばす
      // これ以降新規にobserveしないためにwatcherを止める
      stop()

      // エントリーメッセージだった場合は高さを報告する
      if (bodyRef.value && props.isEntryMessage) {
        const parentTop =
          bodyRef.value.parentElement?.getBoundingClientRect().top ?? 0
        const { top } = bodyRef.value.getBoundingClientRect()
        context.emit('entry-message-loaded', top - parentTop)
      }
    } else {
      context.emit('change-height', {
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
  const stop = watchEffect(async () => {
    if (
      (props.isEntryMessage ||
        (state.content.length > 0 && state.fileIds.length > 0)) &&
      bodyRef.value
    ) {
      // 添付ファイルがある場合は高さ監視をする
      resizeObserver.observe(bodyRef.value)
    }
  })
  watch(
    () => context.root.$route.path,
    () =>
      // パス変更でunobserve
      // vue-routerのインスタンス再利用対策
      bodyRef.value ? resizeObserver.unobserve(bodyRef.value) : undefined
  )
}

export default useElementRenderObserver
