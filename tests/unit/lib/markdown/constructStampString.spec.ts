import { constructStampString } from '/@/lib/markdown/constructStampString'

describe('constructStampString', () => {
  it('can construct without effects (1)', () => {
    expect(constructStampString('stamp', undefined, undefined)).toBe(':stamp:')
  })
  it('can construct without effects (2)', () => {
    expect(constructStampString('stamp', undefined, [])).toBe(':stamp:')
  })
  it('can construct with size effect', () => {
    expect(constructStampString('stamp', 'large', [])).toBe(':stamp.large:')
  })
  it('can construct with anime effects', () => {
    expect(
      constructStampString('stamp', undefined, ['atsumori', 'happa'])
    ).toBe(':stamp.atsumori.happa:')
  })
  it('can construct with both effects', () => {
    expect(constructStampString('stamp', 'large', ['happa'])).toBe(
      ':stamp.large.happa:'
    )
  })
})
