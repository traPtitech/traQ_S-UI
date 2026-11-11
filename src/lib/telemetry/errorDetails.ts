import type {
  ExceptionStackFrame,
  StacktraceParser
} from '@grafana/faro-web-sdk'

export type ErrorDetailsInput = {
  reason: unknown
  caller?: Error
  event?: ErrorEvent
}

export const isException = (value: unknown) =>
  value instanceof Error || value instanceof DOMException

const errorTypes = new Set([
  'AbortError',
  'AggregateError',
  'AxiosError',
  'InvalidStateError',
  'NetworkError',
  'NotAllowedError',
  'NotFoundError',
  'QuotaExceededError',
  'RangeError',
  'ReferenceError',
  'SecurityError',
  'SyntaxError',
  'TypeError',
  'URIError'
])

const getAppFrame = ({
  filename,
  lineno,
  colno
}: Pick<ExceptionStackFrame, 'filename' | 'lineno' | 'colno'>) => {
  try {
    const { origin, pathname } = new URL(filename, location.origin)
    if (origin !== location.origin) return

    const isAsset = /^\/assets\/[\w-]+\.js$/.test(pathname)
    const isSource =
      import.meta.env.DEV && /^\/src\/[\w./-]+\.(ts|js|vue)$/.test(pathname)

    if (!isAsset && !isSource) return

    return { filename: pathname, function: '?', lineno, colno }
  } catch {
    return
  }
}

export const getSafeErrorDetails = (
  { reason, caller, event }: ErrorDetailsInput,
  parseStacktrace: StacktraceParser | undefined
) => {
  const exception = isException(reason) ? reason : undefined
  const name = exception?.name
  const stack = caller ?? exception
  const frames = stack ? (parseStacktrace?.(stack).frames ?? []) : []

  // console.error の呼び出し元を先頭にするため、収集処理自身のフレームを除く。
  const stackFrames = (caller ? frames.slice(1) : frames)
    .map(getAppFrame)
    .filter(frame => frame !== undefined)
    .slice(0, 5)

  if (stackFrames.length === 0 && event) {
    const frame = getAppFrame(event)
    if (frame) stackFrames.push(frame)
  }

  return {
    type: name && errorTypes.has(name) ? name : 'Error',
    stackFrames
  }
}
