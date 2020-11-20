import { computed, reactive, Ref, onMounted, onBeforeUnmount } from 'vue'
import {
  Point,
  diff,
  getDistance,
  getMidpoint,
  getAngleBetweenLines
} from '@/lib/point'

const ZOOM_STEP = 1.2
const MIN_PINCH_DISTANCE = 30

export interface State {
  /**
   * Viewerの中心を原点としたときの画像の中心の座標
   */
  centerDiff: Point
  /**
   * 拡大レベル (0のとき等倍)
   */
  zoomLevel: number
  /**
   * 回転 (deg、-180～180)
   */
  rotate: number
}

const clientXYToPoint = (e: { clientX: number; clientY: number }) => ({
  x: e.clientX,
  y: e.clientY
})

const touches2ToPoints2 = ([a, b]: readonly [Touch, Touch]) =>
  [clientXYToPoint(a), clientXYToPoint(b)] as const

const touchesToDistance = (touches: readonly [Touch, Touch]) =>
  getDistance(touches2ToPoints2(touches))

const getTouchesMidpoint = (touches: readonly Touch[]) =>
  getMidpoint(touches.map(touch => clientXYToPoint(touch)))

const getAngleBetweenLinesFromTouches = (
  touchesA: readonly [Touch, Touch],
  touchesB: readonly [Touch, Touch]
) =>
  getAngleBetweenLines(touches2ToPoints2(touchesA), touches2ToPoints2(touchesB))

const getNewZoomLevel = (isZoomIn: boolean, oldZoomRatio: number) => {
  let r = oldZoomRatio
  if (isZoomIn) {
    r++
  } else {
    r--
  }
  return r
}

const useMouseMove = (
  containerEle: Ref<HTMLElement | undefined>,
  handler: (newPoint: Point, oldPoint: Point) => void
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
  handler: (wheelEvent: WheelEvent, point: Point) => void
) => {
  const onWheel = (e: WheelEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { top, left } = containerEle.value!.getBoundingClientRect()
    handler(e, {
      x: e.clientX - left,
      y: e.clientY - top
    })
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
  moveHandler: (newPoint: Point, oldPoint: Point) => void,
  pinchHandler: (
    newDistance: number,
    oldDistance: number,
    midpoint: Point,
    rotateAngle: number
  ) => void
) => {
  let handlingTouch = false
  const onTouchStart = (_startEvent: TouchEvent) => {
    if (handlingTouch) return
    handlingTouch = true

    let lastMoveTouch: Touch | null = null
    let lastPinchTouches: readonly [Touch, Touch] | null = null

    const onMove = (moveEvent: TouchEvent) => {
      const touches = moveEvent.targetTouches

      if (touches.length >= 2) {
        lastMoveTouch = null
        lastPinchTouches = pinch(touches, lastPinchTouches)
      } else if (touches.length >= 1) {
        lastMoveTouch = move(touches, lastMoveTouch)
        lastPinchTouches = null
      }
    }

    const move = (targetTouches: TouchList, lastMoveTouch: Touch | null) => {
      const newMoveTouch = targetTouches[0]
      if (lastMoveTouch === null) return newMoveTouch

      moveHandler(clientXYToPoint(newMoveTouch), clientXYToPoint(lastMoveTouch))

      return newMoveTouch
    }
    const pinch = (
      targetTouches: TouchList,
      lastPinchTouches: readonly [Touch, Touch] | null
    ) => {
      let newPinchTouches = [targetTouches[0], targetTouches[1]] as const
      if (lastPinchTouches === null) return newPinchTouches

      let newDistance = touchesToDistance(newPinchTouches)
      const oldDistance = touchesToDistance(lastPinchTouches)

      // 変化が一定距離以下の場合は拡大率の変化はなしにする
      if (Math.abs(newDistance - oldDistance) < MIN_PINCH_DISTANCE) {
        newDistance = oldDistance
        newPinchTouches = lastPinchTouches
      }

      pinchHandler(
        newDistance,
        oldDistance,
        getTouchesMidpoint([...newPinchTouches, ...lastPinchTouches]),
        getAngleBetweenLinesFromTouches(newPinchTouches, lastPinchTouches)
      )

      return newPinchTouches
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    containerEle.value!.addEventListener('touchmove', onMove)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    containerEle.value!.addEventListener(
      'touchend',
      _endEvent => {
        handlingTouch = false

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        containerEle.value!.removeEventListener('touchmove', onMove)
      },
      { once: true }
    )
  }

  onMounted(() => {
    containerEle.value?.addEventListener('touchstart', onTouchStart)
  })
  onBeforeUnmount(() => {
    containerEle.value?.removeEventListener('touchstart', onTouchStart)
  })
}

const useImageViewer = (
  containerEle: Ref<HTMLElement | undefined>,
  state: State
) => {
  /**
   * 拡大率 (1.0で等倍)
   */
  const zoomRatio = computed(() => ZOOM_STEP ** state.zoomLevel)

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
      transform: `translate(-50%, -50%) scale(${zoomRatio.value}) translate(${
        state.centerDiff.x / zoomRatio.value
      }px, ${state.centerDiff.y / zoomRatio.value}px)`
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
  const rewriteZoomLevel = (isZoomIn: boolean, point: Point) => {
    const oldZoomLevel = state.zoomLevel
    const oldZoomRatio = zoomRatio.value

    const newZoomLevel = getNewZoomLevel(isZoomIn, oldZoomLevel)
    state.zoomLevel = newZoomLevel
    const newZoomRatio = zoomRatio.value

    // 左上を原点としたときのviewerの中心点
    const viewerCenterPoint = {
      x: (containerEle.value?.offsetWidth ?? 0) / 2,
      y: (containerEle.value?.offsetHeight ?? 0) / 2
    }

    // 拡大縮小の中心点のviewerの中心点からのずれ
    const zoomCenterDiff = diff(point, viewerCenterPoint)
    // 拡大縮小の中心点の画像の中心点からのずれ
    const zoomCenterDiffFromImg = diff(zoomCenterDiff, state.centerDiff)

    state.centerDiff.x -=
      (zoomCenterDiffFromImg.x * (newZoomRatio - oldZoomRatio)) / oldZoomRatio
    state.centerDiff.y -=
      (zoomCenterDiffFromImg.y * (newZoomRatio - oldZoomRatio)) / oldZoomRatio
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
        r += 4
      } else {
        r -= 4
      }
      rewriteRotate(r)
    } else {
      rewriteZoomLevel(e.deltaY < 0, point)
    }
  })

  useTouch(
    containerEle,
    (newPoint, oldPoint) => {
      rewriteCenterDiff(newPoint, oldPoint)
    },
    (newDistance, oldDistance, centerPoint, rotateAngle) => {
      rewriteRotate(state.rotate + rotateAngle)

      // 変化がないときは処理しない(oldDistanceを変更しないのはuseTouch内で実装)
      if (newDistance === oldDistance) return
      rewriteZoomLevel(newDistance - oldDistance >= 0, centerPoint)
    }
  )

  return { styles }
}

export default useImageViewer
