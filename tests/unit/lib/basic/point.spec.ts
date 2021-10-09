import {
  diff,
  getAngle,
  getAngleBetweenLines,
  getAngleOfLine,
  getDistance,
  getMidpoint
} from '/@/lib/basic/point'

describe('diff', () => {
  it('should work', () => {
    const actual = diff({ x: 0, y: 0 }, { x: 1, y: 1 })
    expect(actual).toEqual({ x: -1, y: -1 })
  })
})

describe('getDistance', () => {
  it('should work', () => {
    const actual = getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })
    expect(actual).toBe(5)
  })
})

describe('getMidpoint', () => {
  it('should work with 0 arg', () => {
    const actual = getMidpoint()
    expect(actual).toEqual({ x: NaN, y: NaN })
  })
  it('should work with 1 arg', () => {
    const actual = getMidpoint({ x: 0, y: 0 })
    expect(actual).toEqual({ x: 0, y: 0 })
  })
  it('should work with 2 args', () => {
    const actual = getMidpoint({ x: -1, y: -1 }, { x: 1, y: 1 })
    expect(actual).toEqual({ x: 0, y: 0 })
  })
})

describe('getAngle', () => {
  it('should work (1)', () => {
    const actual = getAngle({ x: 1, y: 1 })
    expect(actual).toBe(45)
  })
  it('should work (2)', () => {
    const actual = getAngle({ x: -1, y: 1 })
    expect(actual).toBe(135)
  })
  it('should work (3)', () => {
    const actual = getAngle({ x: 1, y: -1 })
    expect(actual).toBe(-45)
  })
  it('should work (4)', () => {
    const actual = getAngle({ x: -1, y: -1 })
    expect(actual).toBe(-135)
  })
})

describe('getAngleOfLine', () => {
  it('should work (1)', () => {
    const actual = getAngleOfLine([
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ])
    expect(actual).toBe(45)
  })
  it('should work (2)', () => {
    const actual = getAngleOfLine([
      { x: 1, y: 1 },
      { x: 0, y: 0 }
    ])
    expect(actual).toBe(-135)
  })
})

describe('getAngleBetweenLines', () => {
  it('should work (1)', () => {
    const actual = getAngleBetweenLines(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 }
      ],
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
      ]
    )
    expect(actual).toBe(45)
  })
  it('should work (2)', () => {
    const actual = getAngleBetweenLines(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 }
      ],
      [
        { x: 0, y: 0 },
        { x: -1, y: 0 }
      ]
    )
    expect(actual).toBe(180)
  })
  it('should work (3)', () => {
    const actual = getAngleBetweenLines(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 }
      ],
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 }
      ]
    )
    expect(actual).toBe(0)
  })
})
