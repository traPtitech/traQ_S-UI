import { isValidTwitter } from '/@/lib/validate'

describe('isValidTwitter', () => {
  it('should return true', () => {
    expect(isValidTwitter('traPtitech')).toBe(true)
  })

  it('should return false when containing invalid character', () => {
    expect(isValidTwitter('とらっぷ')).toBe(false)
  })
  it('should return false when it is too long', () => {
    expect(isValidTwitter('1111111111111111')).toBe(false)
  })
  it('should return false when it is empty', () => {
    expect(isValidTwitter('')).toBe(false)
  })
})
