import { onMounted, onUnmounted } from 'vue'
import useEventListener from './useEventListener'

const useScreenWakeLock = () => {
  if (!navigator.wakeLock) return

  let wakeLock: WakeLockSentinel | null = null
  const reacquireWakeLock = async () => {
    if (wakeLock?.released) {
      wakeLock = await navigator.wakeLock.request('screen')
    }
  }

  useEventListener(document, 'visibilitychange', reacquireWakeLock)

  onMounted(async () => {
    wakeLock = await navigator.wakeLock.request('screen')
  })
  onUnmounted(async () => {
    await wakeLock?.release()
    wakeLock = null
  })
}

export default useScreenWakeLock
