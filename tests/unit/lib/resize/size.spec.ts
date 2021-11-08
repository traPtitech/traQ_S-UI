import { needResize, getThumbnailDimensions } from '/@/lib/resize/size'

describe('needResize', () => {
  it('can detect too large width and height', () => {
    expect(needResize({ width: 3000, height: 1800 })).toBe(true)
  })
  it('can detect too large width', () => {
    expect(needResize({ width: 3000, height: 1400 })).toBe(true)
  })
  it('can detect too large height', () => {
    expect(needResize({ width: 2400, height: 1800 })).toBe(true)
  })
  it('can detect valid width and height', () => {
    expect(needResize({ width: 2400, height: 1400 })).toBe(false)
  })
})

describe('getThumbnailDimensions', () => {
  it('can get from square', () => {
    expect(
      getThumbnailDimensions({
        width: 3000,
        height: 3000
      })
    ).toEqual({
      width: 1600,
      height: 1600
    })
  })
  it('can get from portrait', () => {
    expect(
      getThumbnailDimensions({
        width: 3000,
        height: 2000
      })
    ).toEqual({
      width: 2400,
      height: 1600
    })
  })
  it('can get from landscape', () => {
    expect(
      getThumbnailDimensions({
        width: 1500,
        height: 2000
      })
    ).toEqual({
      width: 1200,
      height: 1600
    })
  })
})
