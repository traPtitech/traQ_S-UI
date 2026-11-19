import { elementScroll, observeElementOffset } from '@tanstack/vue-virtual'

export const createScrollCorrectionHandlers = () => {
  let correctionOffset: number | undefined

  const observeOffset: typeof observeElementOffset<HTMLElement> = (
    instance,
    callback
  ) => {
    correctionOffset = undefined

    return observeElementOffset(instance, (offset, isScrolling) => {
      const isCorrection = offset === correctionOffset
      correctionOffset = undefined

      // 補正による scroll をユーザー操作として扱うと後続の高さ変更の補正が抜け落ちる。
      callback(offset, isScrolling && (!isCorrection || instance.isScrolling))
    })
  }

  const scrollTo: typeof elementScroll<HTMLElement> = (
    offset,
    options,
    instance
  ) => {
    elementScroll(offset, options, instance)

    // ブラウザーが座標を丸める場合があるので書き込み後の値で照合する。
    correctionOffset =
      options.adjustments !== undefined
        ? instance.scrollElement?.scrollTop
        : undefined
  }

  return { observeElementOffset: observeOffset, scrollToFn: scrollTo }
}
