import { LogLevel, LoggerNames, getLogger, setLogLevel } from 'livekit-client'

const ignoredMessages = [
  "publisher data channel 'DATA_TRACK_LOSSY' closed unexpectedly"
]

type LogMethod = (...args: unknown[]) => void
type MethodFactory = (
  methodName: string,
  level: LogLevel,
  loggerName: string | symbol
) => LogMethod
type LoglevelLogger = { methodFactory: MethodFactory }

let configured = false

export const configureLiveKitLogger = () => {
  if (configured) return
  configured = true

  const engineLogger = getLogger(
    LoggerNames.Engine
  ) as unknown as LoglevelLogger
  const originalFactory = engineLogger.methodFactory
  engineLogger.methodFactory = (methodName, level, loggerName) => {
    const rawMethod = originalFactory(methodName, level, loggerName)
    return (...args) => {
      const [message] = args
      if (
        typeof message === 'string' &&
        ignoredMessages.some(ignored => message.includes(ignored))
      ) {
        return
      }
      rawMethod(...args)
    }
  }

  setLogLevel(import.meta.env.DEV ? LogLevel.info : LogLevel.warn)
}
