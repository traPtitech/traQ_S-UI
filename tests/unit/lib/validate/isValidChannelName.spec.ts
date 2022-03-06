import { isValidChannelName } from '/@/lib/validate'

describe('isValidChannelName', () => {
  it('should return true', () => {
    expect(isValidChannelName('general')).toBe(true)
  })

  it('should return false when containing invalid character', () => {
    expect(isValidChannelName('ちゃんねる')).toBe(false)
  })
  it('should return false when it is too long', () => {
    expect(isValidChannelName('111111111111111111111')).toBe(false)
  })
  it('should return false when it is empty', () => {
    expect(isValidChannelName('')).toBe(false)
  })
})
