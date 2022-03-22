import { Emitter, EventType, Handler } from 'mitt'
import { onUnmounted } from 'vue'

const useMittListener = <
  Events extends Record<EventType, unknown>,
  Key extends keyof Events
>(
  mitt: Omit<Emitter<Events>, 'emit'>,
  type: Key,
  f: Handler<Events[Key]>
) => {
  mitt.on(type, f)

  onUnmounted(() => {
    mitt.off(type, f)
  })
}

export default useMittListener
