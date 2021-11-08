import { canResize, isJpeg } from '/@/lib/resize'

describe('canResize', () => {
  it('can check png', () => {
    expect(canResize('image/png')).toBe(true)
  })
  it('can check jpeg', () => {
    expect(canResize('image/jpeg')).toBe(true)
  })
  it('can check other (1)', () => {
    expect(canResize('image/gif')).toBe(false)
  })
  it('can check other (2)', () => {
    expect(canResize('text/html')).toBe(false)
  })
})

describe('isJpeg', () => {
  it('can check png', () => {
    expect(isJpeg('image/png')).toBe(false)
  })
  it('can check jpeg', () => {
    expect(isJpeg('image/jpeg')).toBe(true)
  })
})
