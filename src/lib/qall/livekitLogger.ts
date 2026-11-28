import { LogLevel, LoggerNames, getLogger, setLogLevel } from 'livekit-client'

/**
 * 通話に影響しないことがわかっていて、エラーとして出す必要のないログ
 *
 * - `DATA_TRACK_LOSSY`: livekit-client が自動で開くデータトラック用のチャネル。
 *   traQ では使っておらず、対応していない LiveKit サーバーでは接続直後に閉じられて毎回エラーが出る
 */
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

/**
 * livekit-client のログを整理する
 *
 * livekit-client は初期設定で info レベルのログ (接続状態の変化など) を出すため、
 * 正常時でもコンソールがログで埋まり、異常との区別がつきにくい。
 * 本番では warn 以上だけを出し、無害なことがわかっているものは出さない。
 */
export const configureLiveKitLogger = () => {
  if (configured) return
  configured = true

  // getLogger は ctxFn を渡さなければ loglevel のロガーそのものを返す
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

  // setLogLevel でロガーのメソッドが作り直され、上の methodFactory が反映される
  setLogLevel(import.meta.env.DEV ? LogLevel.info : LogLevel.warn)
}
