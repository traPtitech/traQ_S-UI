import { isValidX } from '/@/lib/validate'

describe('isValidX', () => {
  it('should return true', () => {
    expect(isValidX('traPtitech')).toBe(true)
  })

  it('should return false when containing invalid character', () => {
    expect(isValidX('とらっぷ')).toBe(false)
  })
  it('should return false when it is too long', () => {
    expect(isValidX('1111111111111111')).toBe(false)
  })
  it('should return false when it is empty', () => {
    expect(isValidX('')).toBe(false)
  })
})
