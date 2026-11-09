import { isTelemetryEnabled, publish } from './client'
import type { ErrorDetailsInput } from './errorDetails'
import { getSafeErrorDetails, isException } from './errorDetails'

type CapturedError = ErrorDetailsInput & {
  source: 'window_error' | 'unhandled_rejection' | 'console_error'
}

let errorMinute = -1
let errorCount = 0
let stopCollection: (() => void) | undefined

const report = (error: CapturedError) => {
  const minute = Math.floor(performance.now() / 60_000)
  if (minute !== errorMinute) {
    errorMinute = minute
    errorCount = 0
  }

  if (errorCount >= 10) return
  errorCount++

  const timestamp = Date.now()
  void publish((api, clientId) => {
    api.pushError(new Error(error.source), {
      ...getSafeErrorDetails(error, api.getStacktraceParser()),
      context: { source: error.source, client_id: clientId },
      timestampOverwriteMs: timestamp
    })
  })
}

export const startErrorCollection = () => {
  if (!isTelemetryEnabled()) return
  if (stopCollection) return stopCollection

  const controller = new window.AbortController()
  const options = { signal: controller.signal }

  const onError = (event: ErrorEvent) => {
    report({ source: 'window_error', reason: event.error, event })
  }

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    report({ source: 'unhandled_rejection', reason: event.reason })
  }

  window.addEventListener('error', onError, options)
  window.addEventListener('unhandledrejection', onUnhandledRejection, options)

  const browserConsole = window.console
  const originalConsoleError = browserConsole.error
  const onConsoleError = (...args: unknown[]) => {
    originalConsoleError.apply(browserConsole, args)

    try {
      report({
        source: 'console_error',
        reason: args.find(isException),
        caller: new Error()
      })
    } catch {
      return
    }
  }

  browserConsole.error = onConsoleError

  const stop = () => {
    if (stopCollection !== stop) return
    stopCollection = undefined
    controller.abort()

    if (browserConsole.error === onConsoleError) {
      browserConsole.error = originalConsoleError
    }
  }

  stopCollection = stop
  return stop
}

export const stopErrorCollection = () => stopCollection?.()
