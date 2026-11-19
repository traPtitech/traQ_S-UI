import { onScopeDispose, watch } from 'vue'
import type { Ref } from 'vue'

import { useEventListener, useTimeoutFn } from '@vueuse/core'

const useTouchScrollInteraction = (
  scrollElement: Readonly<Ref<HTMLElement | null>>,
  settleDelay: number
) => {
  let isActive = false
  const activeTouches = new Map<number, () => void>()

  const { start: scheduleTouchEnd, stop: cancelTouchEnd } = useTimeoutFn(
    () => {
      isActive = false
    },
    settleDelay,
    { immediate: false }
  )

  const reset = () => {
    cancelTouchEnd()

    for (const stop of activeTouches.values()) {
      stop()
    }

    activeTouches.clear()
    isActive = false
  }

  watch(scrollElement, reset)
  onScopeDispose(reset)

  const onTouchEnd = (event: TouchEvent) => {
    for (const touch of event.changedTouches) {
      activeTouches.get(touch.identifier)?.()
      activeTouches.delete(touch.identifier)
    }

    if (activeTouches.size === 0) scheduleTouchEnd()
  }

  const observe = () => {
    useEventListener(
      scrollElement,
      'touchstart',
      event => {
        cancelTouchEnd()
        isActive = true

        for (const touch of event.changedTouches) {
          activeTouches.get(touch.identifier)?.()

          activeTouches.set(
            touch.identifier,
            useEventListener(
              touch.target,
              ['touchend', 'touchcancel'],
              (event: TouchEvent) => onTouchEnd(event),
              { passive: true }
            )
          )
        }
      },
      { passive: true }
    )

    useEventListener(scrollElement, ['touchend', 'touchcancel'], onTouchEnd, {
      passive: true
    })
  }

  return { isActive: () => isActive, observe }
}

export default useTouchScrollInteraction
