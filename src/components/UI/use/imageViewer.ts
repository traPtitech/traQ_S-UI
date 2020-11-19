import { computed, reactive, Ref, onMounted, onBeforeUnmount } from 'vue'

const ZOOM_STEP = 1.2

interface Point {
  x: number
  y: number
}

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

const eventClientXYToPoint = (e: MouseEvent) => ({
  x: e.clientX,
  y: e.clientY
})

const getNewZoomLevel = (isZoomIn: boolean, oldZoomRatio: number) => {
  let r = oldZoomRatio
  if (isZoomIn) {
    r++
  } else {
    r--
  }
  return r
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
    state.centerDiff.x -= newPoint.x - oldPoint.x
    state.centerDiff.y -= newPoint.y - oldPoint.y
  }
  const rewriteZoomLevel = (isZoomIn: boolean, point: Point) => {
    const oldZoomLevel = state.zoomLevel
    const oldZoomRatio = zoomRatio.value

    const newZoomLevel = getNewZoomLevel(isZoomIn, oldZoomLevel)
    state.zoomLevel = newZoomLevel
    const newZoomRatio = zoomRatio.value

    // 拡大縮小の中心点のviewerの中心点からのずれ
    const zoomCenterDiff = {
      x: point.x - (containerEle.value?.offsetWidth ?? 0) / 2,
      y: point.y - (containerEle.value?.offsetHeight ?? 0) / 2
    }
    // 拡大縮小の中心点の画像の中心点からのずれ
    const zoomCenterDiffFromImg = {
      x: zoomCenterDiff.x - state.centerDiff.x,
      y: zoomCenterDiff.y - state.centerDiff.y
    }

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

  const useMouseMove = () => {
    const centerDiffUpdate = (downEvent: MouseEvent) => {
      let lastPoint = eventClientXYToPoint(downEvent)
      const moveUpdate = (moveEvent: MouseEvent) => {
        const newPoint = eventClientXYToPoint(moveEvent)
        rewriteCenterDiff(newPoint, lastPoint)
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
      containerEle.value?.addEventListener('mousedown', centerDiffUpdate)
    })
    onBeforeUnmount(() => {
      containerEle.value?.removeEventListener('mousedown', centerDiffUpdate)
    })
  }

  const useMouseWheel = () => {
    const onWheel = (e: WheelEvent) => {
      if (e.altKey || e.metaKey) {
        rotateUpdate(e)
      } else {
        zoomRatioUpdate(e)
      }
    }

    const zoomRatioUpdate = (e: WheelEvent) => {
      rewriteZoomLevel(e.deltaY < 0, eventClientXYToPoint(e))
    }
    const rotateUpdate = (e: WheelEvent) => {
      let r = state.rotate
      if (e.deltaY > 0) {
        r += 4
      } else {
        r -= 4
      }
      rewriteRotate(r)
    }

    onMounted(() => {
      containerEle.value?.addEventListener('wheel', onWheel)
    })
    onBeforeUnmount(() => {
      containerEle.value?.removeEventListener('wheel', onWheel)
    })
  }

  useMouseMove()
  useMouseWheel()

  return { styles }
}

export default useImageViewer
