import {
  formatSnakeKeysToCamelShallow,
  reduceToRecord,
  reduceToRecordOfArray
} from '/@/lib/util/record'

describe('reduceToRecord', () => {
  const data = [
    { id: '0', name: 'a' },
    { id: '1', name: 'b' },
    { id: '2', name: 'c' }
  ]
  const dupData = [
    { id: '0', name: 'a' },
    { id: '1', name: 'b' },
    { id: '2', name: 'c' },
    { id: '1', name: 'd' }
  ]

  it('can create record of id key', () => {
    expect(reduceToRecord(data, 'id')).toEqual({
      0: { id: '0', name: 'a' },
      1: { id: '1', name: 'b' },
      2: { id: '2', name: 'c' }
    })
  })
  it('can create record of name key', () => {
    expect(reduceToRecord(data, 'name')).toEqual({
      a: { id: '0', name: 'a' },
      b: { id: '1', name: 'b' },
      c: { id: '2', name: 'c' }
    })
  })

  it('can create record of id key', () => {
    expect(reduceToRecordOfArray(dupData, 'id')).toEqual({
      0: [{ id: '0', name: 'a' }],
      1: [
        { id: '1', name: 'b' },
        { id: '1', name: 'd' }
      ],
      2: [{ id: '2', name: 'c' }]
    })
  })
})

describe('formatSnakeKeysToCamelShallow', () => {
  it('can format snake keys to camel keys', () => {
    const snakeData = {
      key: 'p',
      snake_data: 'o',
      p_O: 'po'
    }
    const camelData = {
      key: 'p',
      snakeData: 'o',
      pO: 'po'
    }

    const formatted = formatSnakeKeysToCamelShallow(snakeData)
    expect(formatted).toEqual(camelData)
  })
})
