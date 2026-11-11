import { pauseTelemetry } from './client'
import {
  trackAppStarted,
  trackClientEnvironmentSnapshot
} from './clientEnvironment'
import { startErrorCollection, stopErrorCollection } from './errorCollection'
import { track } from './events'

export const telemetry = {
  track,
  trackAppStarted,
  trackClientEnvironmentSnapshot,
  startErrorCollection
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopErrorCollection()
    pauseTelemetry()
  })
}
