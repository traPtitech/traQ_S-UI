import { trackAppStarted } from './appStart'
import { pauseTelemetry } from './client'
import { startErrorCollection, stopErrorCollection } from './errorCollection'
import { track } from './events'

export const telemetry = { track, trackAppStarted, startErrorCollection }

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopErrorCollection()
    pauseTelemetry()
  })
}
