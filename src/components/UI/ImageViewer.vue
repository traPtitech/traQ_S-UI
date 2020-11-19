<template>
  <div :class="$style.container" ref="containerEle">
    <img :src="src" :class="$style.img" :style="style" draggable="false" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  onMounted,
  onBeforeUnmount,
  ref,
  Ref
} from 'vue'

const ZOOM_STEP = 1.2

interface Point {
  x: number
  y: number
}

interface State {
  /**
   * Viewerの中心を原点としたときの画像の中心の座標
   */
  centerDiff: Point
  /**
   * 拡大レベル (0のとき等倍)
   */
  zoomLevel: number
  /**
   * 拡大率 (1.0で等倍)
   */
  zoomRatio: number
}

const useStyle = (state: State) => {
  const style = computed(() => ({
    /*
     * - translate(-50%, -50%)は中心にもってくるために必要
     *   (`position: relative; top: 50%; left: 50%`)
     * - translate(x, y)をscale(ratio)の前に持ってくると画像の位置のずれも拡大されてしまうので、
     *   scale(ratio)のあとにおく
     * - translate(x,y)のx,yがzoomRatioで割られているのはscale(ratio)のあとに持ってきているので、
     *   座標軸が拡大されているため
     */
    transform: `translate(-50%, -50%) scale(${state.zoomRatio}) translate(${
      state.centerDiff.x / state.zoomRatio
    }px, ${state.centerDiff.y / state.zoomRatio}px)`
  }))
  return { style }
}

const useMove = (containerEle: Ref<HTMLElement | undefined>, state: State) => {
  const rewriteCenterDiff = (state: State, diff: Point) => {
    state.centerDiff.x += diff.x
    state.centerDiff.y += diff.y
  }

  const centerDiffUpdate = (downEvent: MouseEvent) => {
    const lastPoint = {
      x: downEvent.clientX,
      y: downEvent.clientY
    }
    const moveUpdate = (moveEvent: MouseEvent) => {
      rewriteCenterDiff(state, {
        x: moveEvent.clientX - lastPoint.x,
        y: moveEvent.clientY - lastPoint.y
      })
      lastPoint.x = moveEvent.clientX
      lastPoint.y = moveEvent.clientY
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    containerEle.value!.addEventListener('mousemove', moveUpdate)

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    containerEle.value!.addEventListener(
      'mouseup',
      upEvent => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        containerEle.value!.removeEventListener('mousemove', moveUpdate)
      },
      { once: true }
    )
  }

  onMounted(() => {
    if (!containerEle.value) return
    containerEle.value.addEventListener('mousedown', centerDiffUpdate)
  })
  onBeforeUnmount(() => {
    if (!containerEle.value) return
    containerEle.value.removeEventListener('mousedown', centerDiffUpdate)
  })
}

const useZoom = (containerEle: Ref<HTMLElement | undefined>, state: State) => {
  const getNewZoomLevel = (isZoomIn: boolean, oldZoomRatio: number) => {
    let r = oldZoomRatio
    if (isZoomIn) {
      r++
    } else {
      r--
    }
    return r
  }

  const zoomRatioUpdate = (e: WheelEvent) => {
    const oldZoomLevel = state.zoomLevel
    const oldZoomRatio = state.zoomRatio

    const newZoomLevel = getNewZoomLevel(e.deltaY < 0, oldZoomLevel)
    state.zoomLevel = newZoomLevel
    const newZoomRatio = state.zoomRatio

    // 拡大縮小の中心点のviewerの中心点からのずれ
    const zoomCenterDiff = {
      x: e.clientX - (containerEle.value?.offsetWidth ?? 0) / 2,
      y: e.clientY - (containerEle.value?.offsetHeight ?? 0) / 2
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

  onMounted(() => {
    if (!containerEle.value) return
    containerEle.value.addEventListener('wheel', zoomRatioUpdate)
  })
  onBeforeUnmount(() => {
    if (!containerEle.value) return
    containerEle.value.removeEventListener('wheel', zoomRatioUpdate)
  })
}

export default defineComponent({
  name: 'ImageViewer',
  props: {
    src: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const containerEle = ref<HTMLDivElement>()

    const state: State = reactive({
      centerDiff: {
        x: 0,
        y: 0
      },
      zoomLevel: 0,
      zoomRatio: computed(() => ZOOM_STEP ** state.zoomLevel)
    })
    useZoom(containerEle, state)
    useMove(containerEle, state)

    const { style } = useStyle(state)
    return { containerEle, style }
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  overflow: hidden;
}
.img {
  max-height: 100%;
  max-width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  user-select: none;
}
</style>
