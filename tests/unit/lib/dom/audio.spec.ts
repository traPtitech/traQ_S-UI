import { destroyAudio } from '/@/lib/dom/audio'

const dummyWavUrl =
  'data:audio/wav;base64,UklGRiUAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXQAAAAA'

describe('destroyAudio', () => {
  it('should destroy', () => {
    const pauseMock = vi
      .spyOn(window.HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {
        /* empty */
      })
    const loadMock = vi
      .spyOn(window.HTMLMediaElement.prototype, 'load')
      .mockImplementation(() => {
        /* empty */
      })

    const $audio = new window.Audio(dummyWavUrl)
    destroyAudio($audio)

    expect($audio.src).toBe('')
    expect($audio.hasAttribute('src')).toBe(false)
    expect(pauseMock).toHaveBeenCalledTimes(1)
    expect(loadMock).toHaveBeenCalledTimes(1)
  })
})
