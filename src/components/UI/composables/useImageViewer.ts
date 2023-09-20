import type { Ref } from 'vue'
import { computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import type { Point } from '/@/lib/basic/point'
import {
  diff,
  getDistance,
  getMidpoint,
  getAngleBetweenLines
} from '/@/lib/basic/point'

const WHEEL_SCALE_DELTAX = new Map<number, number>([
  [0x00, 1], // WheelEvent.DOM_DELTA_PIXEL
  [0x01, 10], // WheelEvent.DOM_DELTA_LINE
  [0x02, 20] // WheelEvent.DOM_DELTA_PAGE
])
const WHEEL_SCALE_DELTAY = new Map<number, number>([
  [0x00, 1], // WheelEvent.DOM_DELTA_PIXEL
  [0x01, 10], // WheelEvent.DOM_DELTA_LINE
  [0x02, 20] // WheelEvent.DOM_DELTA_PAGE
])

const WHEEL_SCROLL_SCALE_X = 0.5
const WHEEL_SCROLL_SCALE_Y = 0.5
const WHEEL_ZOOM_SCALE = 0.01
const ZOOM_RATIO_MIN = 1.0
const ROTATE_STEP = 5

export interface State {
  /**
   * Viewerの中心を原点としたときの画像の中心の座標
   */
  centerDiff: Point
  /**
   * 拡大倍率 (1.0のとき等倍)
   */
  zoomRatio: number
  /**
   * 回転 (deg、-180～180)
   */
  rotate: number
}

const clientXYToPoint = (e: { clientX: number; clientY: number }) => ({
  x: e.clientX,
  y: e.clientY
})

type TwoTouch = readonly [Touch, Touch]

const touchesToPoints = <T extends readonly Touch[]>(touches: T) =>
  touches.map(touch => clientXYToPoint(touch)) as unknown as {
    readonly [K in keyof T]: Point
  }

const touchesToDistance = (touches: TwoTouch) => {
  const [p, q] = touchesToPoints(touches)
  return getDistance(p, q)
}

const getTouchesMidpoint = (...touches: readonly Touch[]) =>
  getMidpoint(...touchesToPoints(touches))

const getAngleBetweenLinesFromTouches = (
  touchesA: TwoTouch,
  touchesB: TwoTouch
) => getAngleBetweenLines(touchesToPoints(touchesA), touchesToPoints(touchesB))

/**
 * 座標軸は合わせていないので相対的な情報のみ使える
 * @param newPoint 現在の点
 * @param firstPoint タッチ開始時の点
 */
type MoveHandler = (newPoint: Point, firstPoint: Point) => void

/**
 * @param point スクロールをした点
 */
type WheelHandler = (wheelEvent: WheelEvent, point: Point) => void

/**
 * @param newDistance 新しい指二本の間の距離
 * @param firstDistance タッチ開始時の指二本の間の距離
 * @param newMidpoint 新しい指二本の中点
 * @param firstMidpoint タッチ開始時の指二本の中点
 * @param rotateAngle タッチ開始時から変化した角度
 */
type PinchHandler = (
  newDistance: number,
  firstDistance: number,
  newMidpoint: Point,
  firstMidpoint: Point,
  rotateAngle: number
) => void

/**
 */
type ChangeTouchModeHandler = () => void

const useMouseMove = (
  containerEle: Ref<HTMLElement | undefined>,
  handler: MoveHandler
) => {
  const onDown = (downEvent: MouseEvent) => {
    let lastPoint = clientXYToPoint(downEvent)
    const moveUpdate = (moveEvent: MouseEvent) => {
      const newPoint = clientXYToPoint(moveEvent)
      handler(newPoint, lastPoint)
      lastPoint = newPoint
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    containerEle.value!.addEventListener('mousemove', moveUpdate)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    containerEle.value!.addEventListener(
      'mouseup',
      _upEvent => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        containerEle.value!.removeEventListener('mousemove', moveUpdate)
      },
      { once: true }
    )
  }

  onMounted(() => {
    containerEle.value?.addEventListener('mousedown', onDown)
  })
  onBeforeUnmount(() => {
    containerEle.value?.removeEventListener('mousedown', onDown)
  })
}

const useMouseWheel = (
  containerEle: Ref<HTMLElement | undefined>,
  handler: WheelHandler
) => {
  const onWheel = (e: WheelEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { top, left } = containerEle.value!.getBoundingClientRect()
    handler(e, {
      x: e.clientX - left,
      y: e.clientY - top
    })
    e.preventDefault()
  }

  onMounted(() => {
    containerEle.value?.addEventListener('wheel', onWheel)
  })
  onBeforeUnmount(() => {
    containerEle.value?.removeEventListener('wheel', onWheel)
  })
}

const useTouch = (
  containerEle: Ref<HTMLElement | undefined>,
  moveHandler: MoveHandler,
  pinchHandler: PinchHandler,
  changeTouchModeHandler: ChangeTouchModeHandler
) => {
  let firstMoveTouch: Touch | null = null
  let firstPinchTouches: TwoTouch | null = null

  const onTouchStart = (_startEvent: TouchEvent) => {
    changeTouchMode(_startEvent)
  }
  const onTouchEnd = (_endEvent: TouchEvent) => {
    changeTouchMode(_endEvent)
  }
  const onMove = (moveEvent: TouchEvent) => {
    // タッチによるスクロールの無効化
    moveEvent.preventDefault()

    const touches = moveEvent.touches

    if (firstPinchTouches && touches.length >= 2) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newPinchTouches: TwoTouch = [touches[0]!, touches[1]!]

      pinch(newPinchTouches, firstPinchTouches)
    } else if (firstMoveTouch && touches.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newMoveTouch: Touch = touches[0]!

      move(newMoveTouch, firstMoveTouch)
    }
  }

  const changeTouchMode = (e: TouchEvent) => {
    const touches = e.touches

    if (touches.length >= 2) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newPinchTouches: TwoTouch = [touches[0]!, touches[1]!]

      firstMoveTouch = null
      firstPinchTouches = newPinchTouches
    } else if (touches.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const newMoveTouch: Touch = touches[0]!

      firstMoveTouch = newMoveTouch
      firstPinchTouches = null
    } else {
      firstMoveTouch = null
      firstPinchTouches = null
    }
    changeTouchModeHandler()
  }

  const move = (newMoveTouch: Touch, firstMoveTouch: Touch) => {
    moveHandler(clientXYToPoint(newMoveTouch), clientXYToPoint(firstMoveTouch))
  }

  const pinch = (newPinchTouches: TwoTouch, firstPinchTouches: TwoTouch) => {
    if (firstPinchTouches === null) return newPinchTouches

    const newDistance = touchesToDistance(newPinchTouches)
    const firstDistance = touchesToDistance(firstPinchTouches)

    pinchHandler(
      newDistance,
      firstDistance,
      getTouchesMidpoint(...newPinchTouches),
      getTouchesMidpoint(...firstPinchTouches),
      getAngleBetweenLinesFromTouches(firstPinchTouches, newPinchTouches)
    )

    return newPinchTouches
  }

  onMounted(() => {
    containerEle.value?.addEventListener('touchstart', onTouchStart)
    containerEle.value?.addEventListener('touchmove', onMove)
    containerEle.value?.addEventListener('touchend', onTouchEnd)
  })
  onBeforeUnmount(() => {
    containerEle.value?.removeEventListener('touchstart', onTouchStart)
    containerEle.value?.removeEventListener('touchmove', onMove)
    containerEle.value?.removeEventListener('touchend', onTouchEnd)
  })
}

const useImageViewer = (
  containerEle: Ref<HTMLElement | undefined>,
  imgEle: Ref<HTMLImageElement | undefined>
) => {
  const state: State = reactive({
    centerDiff: {
      x: 0,
      y: 0
    },
    zoomRatio: 1.0,
    rotate: 0
  })

  /**
   * 基準となるタッチ開始時の状態情報
   */
  let firstState: State | null = null

  const styles = reactive({
    imgContainer: computed(() => ({
      /*
       * scale(ratio)による拡縮後にtranslate(x, y)による移動
       */
      transform: `translate(${state.centerDiff.x}px, ${state.centerDiff.y}px) scale(${state.zoomRatio})`
    })),
    img: computed(() => ({
      /*
       * 別のelementで行っているのは回転を同じelementでやるとtranslateとの組み合わせで中心がずれるため
       */
      transform: `rotate(${state.rotate}deg)`
    }))
  })

  const rewriteCenterDiff = (oldPoint: Point, newPoint: Point) => {
    const d = diff(newPoint, oldPoint)
    state.centerDiff.x -= d.x
    state.centerDiff.y -= d.y
  }
  const rewriteRotate = (newRotate: number) => {
    if (360 < newRotate) {
      newRotate -= 360
    }
    state.rotate = newRotate
  }

  const clampCenterDiff = (centerDiff: Point) => {
    if (!imgEle.value) return centerDiff

    const imgRect = imgEle.value.getBoundingClientRect()

    const width = imgEle.value.width * state.zoomRatio
    const height = imgEle.value.height * state.zoomRatio

    const newCenterDiff: Point = {
      x: Math.max(-width / 2, Math.min(width / 2, centerDiff.x)),
      y: Math.max(-height / 2, Math.min(height / 2, centerDiff.y))
    }
    return newCenterDiff
  }

  /**
   * centerDiffを移動範囲制限を適用して変更
   * @return 移動範囲制限が適用されたかどうか
   */
  const rewriteCenterDiffWithClamp = (newCenterDiff: Point) => {
    state.centerDiff = clampCenterDiff(newCenterDiff)
    return (
      state.centerDiff.x !== newCenterDiff.x ||
      state.centerDiff.y !== newCenterDiff.y
    )
  }
  /**
   * zoomRatioを範囲制限を適用して変更
   * @return 範囲制限が適用されたかどうか
   */
  const rewriteZoomRatioWithClamp = (scale: number) => {
    state.zoomRatio = Math.max(ZOOM_RATIO_MIN, scale)
    return state.zoomRatio !== scale
  }

  useMouseMove(containerEle, (newPoint, oldPoint) => {
    const d = diff(newPoint, oldPoint)
    const newCenterDiff = {
      x: state.centerDiff.x + d.x,
      y: state.centerDiff.y + d.y
    }
    rewriteCenterDiffWithClamp(newCenterDiff)
  })

  useMouseWheel(containerEle, (e, point) => {
    const deltaXScale = WHEEL_SCALE_DELTAX.get(e.deltaMode)
    const deltaYScale = WHEEL_SCALE_DELTAY.get(e.deltaMode)
    if (deltaXScale === undefined || deltaYScale === undefined) return

    const deltaX = e.deltaX * deltaXScale
    const deltaY = e.deltaY * deltaYScale

    if (e.altKey || e.metaKey) {
      let r = state.rotate
      if (deltaY > 0) {
        r += ROTATE_STEP
      } else {
        r -= ROTATE_STEP
      }
      rewriteRotate(r)
    } else if (e.ctrlKey) {
      // トラックパッドでズームジェスチャをする場合は e.ctrlKey == true になる
      const beforeScale = state.zoomRatio
      rewriteZoomRatioWithClamp(
        // ratio * exp(a) * exp(b) == ratio * exp(a+b) より deltaYの総和に対応して一定の拡縮
        state.zoomRatio * Math.exp(-deltaY * WHEEL_ZOOM_SCALE)
      )
      const afterScale = state.zoomRatio

      if (containerEle.value) {
        const containerRect = containerEle.value.getBoundingClientRect()
        const cursorCenterDiff = {
          x: e.clientX - containerRect.x - containerRect.width / 2,
          y: e.clientY - containerRect.y - containerRect.height / 2
        }

        const newCenterDiff = {
          x:
            cursorCenterDiff.x +
            ((state.centerDiff.x - cursorCenterDiff.x) * afterScale) /
              beforeScale,
          y:
            cursorCenterDiff.y +
            ((state.centerDiff.y - cursorCenterDiff.y) * afterScale) /
              beforeScale
        }
        rewriteCenterDiffWithClamp(newCenterDiff)
      }
    } else {
      // トラックパッドでスクロールジェスチャをする場合は e.ctrlKey == false になる
      const newCenterDiff = {
        x: state.centerDiff.x - deltaX * WHEEL_SCROLL_SCALE_X,
        y: state.centerDiff.y - deltaY * WHEEL_SCROLL_SCALE_Y
      }
      rewriteCenterDiffWithClamp(newCenterDiff)
    }
  })

  useTouch(
    containerEle,
    (newPoint, firstPoint) => {
      const newCenterDiff = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        x: firstState!.centerDiff.x + newPoint.x - firstPoint.x,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        y: firstState!.centerDiff.y + newPoint.y - firstPoint.y
      }
      rewriteCenterDiffWithClamp(newCenterDiff)
    },
    (newDistance, firstDistance, newMidPoint, firstMidPoint, rotateAngle) => {
      if (containerEle.value) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const beforeScale = firstState!.zoomRatio
        rewriteZoomRatioWithClamp((beforeScale * newDistance) / firstDistance)
        const afterScale = state.zoomRatio
        const scaleDiff = afterScale / beforeScale

        const containerRect = containerEle.value.getBoundingClientRect()
        const newMidPointCenterDiff = {
          x: newMidPoint.x - containerRect.x - containerRect.width / 2,
          y: newMidPoint.y - containerRect.y - containerRect.height / 2
        }
        const firstMidPointCenterDiff = {
          x: firstMidPoint.x - containerRect.x - containerRect.width / 2,
          y: firstMidPoint.y - containerRect.y - containerRect.height / 2
        }

        const newCenterDiff = {
          x:
            newMidPointCenterDiff.x +
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (firstState!.centerDiff.x - firstMidPointCenterDiff.x) * scaleDiff,
          y:
            newMidPointCenterDiff.y +
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (firstState!.centerDiff.y - firstMidPointCenterDiff.y) * scaleDiff
        }

        rewriteCenterDiffWithClamp(newCenterDiff)
      }
    },
    () => {
      firstState = {
        centerDiff: {
          x: state.centerDiff.x,
          y: state.centerDiff.y
        },
        zoomRatio: state.zoomRatio,
        rotate: state.rotate
      }
    }
  )

  return { styles }
}

export default useImageViewer
