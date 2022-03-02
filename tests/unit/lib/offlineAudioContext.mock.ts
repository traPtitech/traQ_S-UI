Object.defineProperty(window, 'OfflineAudioContext', {
  writable: true,
  value: vi.fn((_numberOfChannels, _length, sampleRate) => {
    if (sampleRate < 100) {
      throw new DOMException('not supported')
    } else if (sampleRate < 1000) {
      return { sampleRate } as OfflineAudioContext
    } else if (sampleRate < 2000) {
      const sampleRate2 = Math.floor(sampleRate / 2) * 2
      return { sampleRate: sampleRate2 } as OfflineAudioContext
    }
    throw new DOMException('not supported')
  })
})
