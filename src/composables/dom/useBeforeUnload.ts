import { type MaybeRefOrGetter, toValue } from 'vue'

import { useEventListener } from '@vueuse/core'

export const useBeforeUnload = (
  isEnabled: MaybeRefOrGetter<boolean>,
  message: string,
  onBeforeUnload?: (event: BeforeUnloadEvent) => void
) => {
  useEventListener('beforeunload', (event: BeforeUnloadEvent) => {
    if (!toValue(isEnabled)) return
    onBeforeUnload?.(event)
    event.preventDefault()
    event.returnValue = message
    return message
  })
}
