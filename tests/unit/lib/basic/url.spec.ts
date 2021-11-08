import { getFirstParam, getFirstQuery } from '/@/lib/basic/url'

describe('getFirstParam', () => {
  it('can get string param', () => {
    expect(getFirstParam('str')).toBe('str')
  })
  it('can get empty array param', () => {
    expect(getFirstParam([])).toBeUndefined()
  })
  it('can get array param first element', () => {
    expect(getFirstParam(['a', 'b'])).toBe('a')
  })
})

describe('getFirstQuery', () => {
  it('can get string query', () => {
    expect(getFirstQuery('str')).toBe('str')
  })
  it('can get empty array query', () => {
    expect(getFirstQuery([])).toBeUndefined()
  })
  it('can get null array query', () => {
    expect(getFirstQuery([null])).toBeNull()
  })
  it('can get array query first element', () => {
    expect(getFirstQuery(['a', 'b'])).toBe('a')
  })
})
