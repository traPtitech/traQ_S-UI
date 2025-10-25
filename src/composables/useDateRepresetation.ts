import { ref, onMounted, onUnmounted, watchEffect, computed } from 'vue'
import { getDateRepresentation } from '/@/lib/basic/date'
import mitt from 'mitt'

type Events = {
  midnight: Date
}

export const timeMitt = mitt<Events>()

// Global midnight tick composable
const midnightTick = ref(new Date())
let midnightTimeout: ReturnType<typeof setTimeout> | null = null
function scheduleNextMidnightTick(){
  const now = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const msUntilMidnight = tomorrow.getTime() - now.getTime()
  midnightTimeout = setTimeout(() => {
    midnightTick.value = new Date()
    scheduleNextMidnightTick()
  }, msUntilMidnight)
}
if (typeof window !== 'undefined' && !midnightTimeout) {
  scheduleNextMidnightTick()
}
const useMidnightTick = () => midnightTick
const useDateRepresentation = (updatedAt: string) => {
  const tick = useMidnightTick()
  const date = ref<string>(getDateRepresentation(updatedAt))
  watchEffect(() => {
    // Recompute date when tick or updatedAt changes
    date.value = getDateRepresentation(updatedAt)

    timeMitt.emit('midnight', new Date())
  })}