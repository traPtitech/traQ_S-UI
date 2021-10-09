import { arrayToMap } from '/@/lib/basic/map'

describe('arrayToMap', () => {
  it('can create empty map', () => {
    expect(arrayToMap([], 'k')).toEqual(new Map())
  })
  it('can create map with value', () => {
    const expected = new Map([
      [0, { k: 0 }],
      [1, { k: 1 }]
    ])
    expect(arrayToMap([{ k: 0 }, { k: 1 }], 'k')).toEqual(expected)
  })
})
