import { canResize, isJpeg } from '/@/lib/resize'

describe('canResize', () => {
  it('can check png', () => {
    expect(canResize('image/png')).toEqual(true)
  })
  it('can check jpeg', () => {
    expect(canResize('image/jpeg')).toEqual(true)
  })
  it('can check other (1)', () => {
    expect(canResize('image/gif')).toEqual(false)
  })
  it('can check other (2)', () => {
    expect(canResize('text/html')).toEqual(false)
  })
})

describe('isJpeg', () => {
  it('can check png', () => {
    expect(isJpeg('image/png')).toEqual(false)
  })
  it('can check jpeg', () => {
    expect(isJpeg('image/jpeg')).toEqual(true)
  })
})
