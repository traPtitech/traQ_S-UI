import { isValidStampName } from '/@/lib/validate'

describe('isValidStampName', () => {
  it('should return true', () => {
    expect(isValidStampName('attoteki_seicho')).toBe(true)
  })

  it('should return false when containing invalid character', () => {
    expect(isValidStampName(':stamp:')).toBe(false)
  })
  it('should return false when it is too long', () => {
    expect(isValidStampName('111111111111111111111111111111111')).toBe(false)
  })
  it('should return false when it is empty', () => {
    expect(isValidStampName('')).toBe(false)
  })
})
