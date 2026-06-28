import { type MaybeRefOrGetter, onBeforeUnmount, ref, toValue } from 'vue'

import { useEventListener } from '@vueuse/core'

interface UseDraggingOptions {
  targetRef: MaybeRefOrGetter<HTMLElement | null | undefined>
  onDragStart?: (e: PointerEvent) => void
  onDragging?: (e: PointerEvent) => void
  onDragEnd?: () => void
}

const useDragging = ({
  targetRef,
  onDragStart,
  onDragging,
  onDragEnd
}: UseDraggingOptions) => {
  const isDragging = ref(false)
  let pointerId: null | number = null

  const handleDragStart = (e: PointerEvent) => {
    const target = toValue(targetRef)

    isDragging.value = true

    pointerId = e.pointerId
    target?.setPointerCapture(pointerId)

    onDragStart?.(e)
    e.preventDefault()
  }

  const handleDragging = (e: PointerEvent) => {
    if (!isDragging.value) return

    onDragging?.(e)
    e.preventDefault()
  }

  const handleDragEnd = () => {
    if (!isDragging.value) return
    isDragging.value = false

    const target = toValue(targetRef)

    if (pointerId && target?.hasPointerCapture(pointerId)) {
      target?.releasePointerCapture(pointerId)
    }

    pointerId = null

    onDragEnd?.()
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      handleDragEnd()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleDragEnd()
    }
  }

  useEventListener(['blur', 'pagehide'], handleDragEnd)
  useEventListener(document, 'contextmenu', handleDragEnd)
  useEventListener(document, 'visibilitychange', handleVisibilityChange)
  useEventListener(document, 'keydown', handleKeyDown)
  onBeforeUnmount(handleDragEnd)

  return {
    isDragging,
    onDragStart: handleDragStart,
    onDragging: handleDragging,
    onDragEnd: handleDragEnd
  }
}

export default useDragging
