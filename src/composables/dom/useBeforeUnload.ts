import { type MaybeRefOrGetter, toValue } from 'vue'

import useEventListener from './useEventListener'

export const useBeforeUnload = (
  isEnabled: MaybeRefOrGetter<boolean>,
  message: string,
  onBeforeUnload?: (event: BeforeUnloadEvent) => void
) => {
  useEventListener(window, 'beforeunload', (event: BeforeUnloadEvent) => {
    if (!toValue(isEnabled)) return
    onBeforeUnload?.(event)
    event.preventDefault()
    event.returnValue = message
    return message
  })
}
