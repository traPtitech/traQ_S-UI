import '../offlineAudioContext.mock'

import { checkAudioContextSampleRateSupport } from '/@/lib/dom/browser'

describe('checkAudioContextSampleRateSupport', () => {
  it('should return false if not supported', () => {
    const actual = checkAudioContextSampleRateSupport(50)
    expect(actual).toBe(false)
  })

  it('should return false if sampleRate differs', () => {
    const actual = checkAudioContextSampleRateSupport(1501)
    expect(actual).toBe(false)
  })

  it('should return true if supported', () => {
    const actual = checkAudioContextSampleRateSupport(500)
    expect(actual).toBe(true)
  })
})
