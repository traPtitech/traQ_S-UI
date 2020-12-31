import store from '@/_store'
import { PositionOf, StampSelectHandler } from '@/_store/ui/stampPicker/state'

const MARGIN_BETWEEN = 4

const useStampPickerInvoker = (selectHandler: StampSelectHandler) => {
  const getTopRightPosition = (rect: DOMRect) => ({
    x: rect.right,
    y: rect.top - MARGIN_BETWEEN
  })
  const getBottomRightPosition = (rect: DOMRect) => ({
    x: rect.right,
    y: rect.bottom + MARGIN_BETWEEN
  })

  /**
   * @param element スタンプピッカーを表示する基準となる要素
   * @param positionOf その要素の四隅のどの点の位置にスタンプピッカーの右上が来るかを指定する
   */
  const invokeStampPicker = (
    element: HTMLElement,
    positionOf: PositionOf = 'top-right'
  ) => {
    const rect = element.getBoundingClientRect()
    const position =
      positionOf === 'top-right'
        ? getBottomRightPosition(rect)
        : positionOf === 'bottom-right'
        ? getTopRightPosition(rect)
        : rect // never

    store.dispatch.ui.stampPicker.openStampPicker({
      selectHandler,
      position,
      positionOf
    })
  }
  return {
    invokeStampPicker
  }
}

export default useStampPickerInvoker
