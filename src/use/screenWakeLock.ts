import { onMounted, onUnmounted } from 'vue'

const useScreenWakeLock = () => {
  if (!navigator.wakeLock) return

  let wakeLock: WakeLockSentinel | null = null
  const reacquireWakeLock = async () => {
    if (wakeLock?.released) {
      wakeLock = await navigator.wakeLock.request('screen')
    }
  }

  onMounted(async () => {
    wakeLock = await navigator.wakeLock.request('screen')
    document.addEventListener('visibilitychange', reacquireWakeLock)
  })
  onUnmounted(async () => {
    document.removeEventListener('visibilitychange', reacquireWakeLock)

    await wakeLock?.release()
    wakeLock = null
  })
}

export default useScreenWakeLock
