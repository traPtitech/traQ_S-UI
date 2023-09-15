import type { Ref } from 'vue'
import { computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import type { Point } from '/@/lib/basic/point'
import {
  diff,
  getDistance,
  getMidpoint,
  getAngleBetweenLines
} from '/@/lib/basic/point'

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

    const touches = moveEvent.targetTouches

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
    const touches = e.targetTouches

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

const useImageViewer = (containerEle: Ref<HTMLElement | undefined>) => {
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
       * - translate(-50%, -50%)は中心にもってくるために必要
       *   (`position: relative; top: 50%; left: 50%`)
       * - translate(x, y)をscale(ratio)の前に持ってくると画像の位置のずれも拡大されてしまうので、
       *   scale(ratio)のあとにおく
       * - translate(x,y)のx,yがzoomRatioで割られているのはscale(ratio)のあとに持ってきているので、
       *   座標軸が拡大されているため
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

  useMouseMove(containerEle, (newPoint, oldPoint) => {
    rewriteCenterDiff(newPoint, oldPoint)
  })

  useMouseWheel(containerEle, (e, point) => {
    if (e.altKey || e.metaKey) {
      let r = state.rotate
      if (e.deltaY > 0) {
        r += ROTATE_STEP
      } else {
        r -= ROTATE_STEP
      }
      rewriteRotate(r)
    } else if(e.ctrlKey) {
      // トラックパッドでズームジェスチャをする場合は e.ctrlKey == true になる
      // TODO
    } else {
      // トラックパッドでスクロールジェスチャをする場合は e.ctrlKey == false になる
      // TODO
    }
  })

  useTouch(
    containerEle,
    (newPoint, firstPoint) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state.centerDiff.x = firstState!.centerDiff.x + newPoint.x - firstPoint.x
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      state.centerDiff.y = firstState!.centerDiff.y + newPoint.y - firstPoint.y
    },
    (newDistance, firstDistance, newMidPoint, firstMidPoint, rotateAngle) => {
      if (containerEle.value) {
        const scaleDiff = newDistance / firstDistance

        const newMidPointCenterDiff = {
          x: newMidPoint.x - containerEle.value.clientWidth / 2,
          y: newMidPoint.y - containerEle.value.clientHeight / 2
        }
        const firstMidPointCenterDiff = {
          x: firstMidPoint.x - containerEle.value.clientWidth / 2,
          y: firstMidPoint.y - containerEle.value.clientHeight / 2
        }

        state.centerDiff.x =
          newMidPointCenterDiff.x +
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (firstState!.centerDiff.x - firstMidPointCenterDiff.x) * scaleDiff
        state.centerDiff.y =
          newMidPointCenterDiff.y +
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (firstState!.centerDiff.y - firstMidPointCenterDiff.y) * scaleDiff

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        state.zoomRatio = firstState!.zoomRatio * scaleDiff
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
