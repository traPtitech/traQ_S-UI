import { computed, reactive, watch } from '@vue/composition-api'
import { SwipeDetectorState } from '@/compositions/swipeDetector'

/**
 * スワイプで引き出す系コンポーネントの表示/非表示を決定する
 *
 * `direction`で指定した方向に軸をとることに注意
 *
 * @param direction ドロワーを引き出す方向
 * @param showThreshould 表示状態に移行するx変位の閾値
 * @param hideThreshould 非表示状態に移行するx変位の閾値
 */
export const useSwipeDrawer = (
  swipeDetectorState: SwipeDetectorState,
  direction: 'left' | 'right',
  destination: number,
  showThreshould: number,
  hideThreshould: number,
  animationDurationMs = 500
) => {
  const state = reactive({
    /** 現在のメインビューの位置 */
    currentPosition: 0,

    /** スワイプ開始時のメインビューの位置 */
    startPosition: 0,

    /** requestAnimationFrameのId */
    requestId: -1
  })

  /** ナビゲーションは表示状態になっているか */
  const isNavAppeared = computed(() => state.currentPosition > showThreshould)

  const animatePosition = (to: number) => {
    const startTime = Date.now()
    const diffPerMs = (to - state.currentPosition) / animationDurationMs
    const animationDirectonSign = diffPerMs / Math.abs(diffPerMs)
    const animate = () => {
      const currentTime = Date.now()
      state.currentPosition += diffPerMs * (currentTime - startTime)
      state.startPosition = state.currentPosition
      if (animationDirectonSign * (to - state.currentPosition) > 0) {
        console.log('re-request')
        state.requestId = requestAnimationFrame(animate)
      } else {
        console.log('end')
        state.currentPosition = to
        state.startPosition = to
        cancelAnimationFrame(state.requestId)
        state.requestId = -1
      }
    }
    animate()
  }

  /** 軸を揃える */
  const normalize = (v: number) => (direction === 'right' ? v : -v)

  watch(
    () => swipeDetectorState.swipeDistanceX,
    swipeDistanceX => {
      const diff = normalize(swipeDistanceX)
      const pos = state.startPosition + diff
      state.currentPosition = Math.max(Math.min(pos, destination), 0)
    }
  )
  watch(
    () => swipeDetectorState.isSwiping,
    isSwiping => {
      if (isSwiping) {
        state.startPosition = state.currentPosition
      }
      if (isSwiping && state.requestId !== -1) {
        // スワイプ開始時にanimationFrameをキャンセル
        cancelAnimationFrame(state.requestId)
        state.requestId = -1
      } else if (
        normalize(swipeDetectorState.swipeSpeedX) < 0 ||
        state.currentPosition < hideThreshould
      ) {
        // スワイプ終了、速度がマイナスなので戻す
        console.log('to hide')
        animatePosition(0)
      } else if (
        normalize(swipeDetectorState.swipeSpeedX) > 0 ||
        state.currentPosition > showThreshould
      ) {
        // スワイプ終了、速度がプラスなので出す
        console.log('to show')
        animatePosition(destination)
      }
    }
  )

  return {
    swipeDrawerState: state,
    isNavAppeared
  }
}
