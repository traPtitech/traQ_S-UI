import { computed, reactive, watch, Ref } from 'vue'
import { SwipeDetectorState } from './useSwipeDetector'

type Direction = 'left' | 'right'

const inverse = (d: Direction) => (d === 'left' ? 'right' : 'left')

/**
 * スワイプで引き出す系コンポーネントの表示/非表示を決定する
 *
 * `direction`で指定した方向に軸をとることに注意
 *
 * @param direction ドロワーを引き出す方向
 * @param showThreshould 表示状態に移行するx変位の閾値
 * @param hideThreshould 非表示状態に移行するx変位の閾値
 */
const useSwipeDrawer = (
  swipeDetectorState: Readonly<SwipeDetectorState>,
  direction: Direction,
  destination: number,
  showThreshould: number,
  hideThreshould: number,
  inactive?: Readonly<Ref<boolean>>,
  onInteractionStart?: (isAppearing: boolean) => void,
  animationDurationMs = 700
) => {
  const state = reactive({
    /** 現在のメインビューの位置 */
    currentPosition: 0,

    /** スワイプ開始時のメインビューの位置 */
    startPosition: 0,

    /** requestAnimationFrameのId */
    requestId: -1,

    /** 引き出しはじめか */
    isInitial: true
  })

  /** 次はどちら向きへの操作か */
  const supporsedDirection = computed(
    (): Direction =>
      state.startPosition < destination / 2 ? direction : inverse(direction)
  )

  /** ナビゲーションは表示状態になっているか */
  const isAppeared = computed(() => state.currentPosition > 0)

  /** ナビゲーションは完全に表示状態になっているか */
  const isCompletelyAppeared = computed(
    () => state.currentPosition >= destination
  )

  /** ナビゲーションの表示が開始されたか */
  const isAppearingStarted = computed(() => state.currentPosition > 0)

  /** 指定した位置まで`state.currentPosition`をアニメーションさせる */
  const animatePosition = (to: number) => {
    const startTime = Date.now()
    const diffPerMs = (to - state.currentPosition) / animationDurationMs
    const animationDirectonSign = diffPerMs / Math.abs(diffPerMs)
    const animate = () => {
      const currentTime = Date.now()
      state.currentPosition += diffPerMs * (currentTime - startTime)
      state.startPosition = state.currentPosition
      if (animationDirectonSign * (to - state.currentPosition) > 0) {
        state.requestId = requestAnimationFrame(animate)
      } else {
        state.currentPosition = to
        state.startPosition = to
        cancelAnimationFrame(state.requestId)
        state.requestId = -1
      }
    }
    animate()
  }

  /** 状態初期化 */
  const resetState = () => {
    state.currentPosition = 0
    state.startPosition = 0
    state.requestId = -1
    state.isInitial = true
  }

  /** 軸を揃える */
  const normalize = (v: number) => (direction === 'right' ? v : -v)

  const openDrawer = () => animatePosition(destination)
  const closeDrawer = () => animatePosition(0)

  watch(
    () => swipeDetectorState.swipeDistanceX,
    swipeDistanceX => {
      if (inactive?.value) {
        return
      }
      const diff = normalize(swipeDistanceX)
      const pos = state.startPosition + diff
      state.currentPosition = Math.max(Math.min(pos, destination), 0)
    }
  )
  watch(
    () => swipeDetectorState.swipeDirection,
    swipeDirection => {
      if (inactive?.value) {
        return
      }
      if (swipeDirection === supporsedDirection.value) {
        state.startPosition = state.currentPosition
        if (state.isInitial && onInteractionStart) {
          onInteractionStart(supporsedDirection.value === direction)
          state.isInitial = false
        }
      }
      if (
        swipeDirection === supporsedDirection.value &&
        state.requestId !== -1
      ) {
        // スワイプ開始時にanimationFrameをキャンセル
        cancelAnimationFrame(state.requestId)
        state.requestId = -1
      } else if (
        normalize(swipeDetectorState.swipeSpeedX) < 0 ||
        state.currentPosition < hideThreshould
      ) {
        // スワイプ終了、速度がマイナスなので戻す
        animatePosition(0)
        state.isInitial = true
      } else if (
        normalize(swipeDetectorState.swipeSpeedX) > 0 ||
        state.currentPosition > showThreshould
      ) {
        // スワイプ終了、速度がプラスなので出す
        animatePosition(destination)
        state.isInitial = true
      }
    }
  )

  return {
    swipeDrawerState: state,
    isAppeared,
    isCompletelyAppeared,
    isAppearingStarted,
    openDrawer,
    closeDrawer,
    resetState
  }
}

export default useSwipeDrawer
