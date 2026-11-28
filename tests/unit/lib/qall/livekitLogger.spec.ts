import { LoggerNames, getLogger } from 'livekit-client'

import { configureLiveKitLogger } from '/@/lib/qall/livekitLogger'

describe('configureLiveKitLogger', () => {
  beforeAll(() => {
    configureLiveKitLogger()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('drops the known harmless data channel error', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    // loglevel はメソッドを作るときに console のメソッドを束縛するので、spy の後に作り直す
    configureLiveKitLoggerAgain()

    getLogger(LoggerNames.Engine).error(
      "publisher data channel 'DATA_TRACK_LOSSY' closed unexpectedly",
      { room: 'room' }
    )
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('keeps other errors', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    configureLiveKitLoggerAgain()

    getLogger(LoggerNames.Engine).error('something went wrong')
    expect(errorSpy).toHaveBeenCalled()
  })

  it('hides info logs outside development', () => {
    const infoSpy = vi
      .spyOn(console, 'info')
      .mockImplementation(() => undefined)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    configureLiveKitLoggerAgain()

    getLogger(LoggerNames.Engine).info('connection state changed')
    if (import.meta.env.DEV) {
      expect(infoSpy.mock.calls.length + logSpy.mock.calls.length).toBe(1)
    } else {
      expect(infoSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
    }
  })
})

/**
 * 現在のレベルのまま loglevel にメソッドを作り直させる
 */
const configureLiveKitLoggerAgain = () => {
  const logger = getLogger(LoggerNames.Engine) as unknown as {
    getLevel: () => number
    setLevel: (level: number) => void
  }
  logger.setLevel(logger.getLevel())
}
