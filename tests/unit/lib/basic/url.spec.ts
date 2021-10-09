import { getFirstParam, getFirstQuery } from '/@/lib/basic/url'

describe('getFirstParam', () => {
  it('can get string param', () => {
    expect(getFirstParam('str')).toEqual('str')
  })
  it('can get empty array param', () => {
    expect(getFirstParam([])).toEqual(undefined)
  })
  it('can get array param first element', () => {
    expect(getFirstParam(['a', 'b'])).toEqual('a')
  })
})

describe('getFirstQuery', () => {
  it('can get string query', () => {
    expect(getFirstQuery('str')).toEqual('str')
  })
  it('can get empty array query', () => {
    expect(getFirstQuery([])).toEqual(undefined)
  })
  it('can get null array query', () => {
    expect(getFirstQuery([null])).toEqual(null)
  })
  it('can get array query first element', () => {
    expect(getFirstQuery(['a', 'b'])).toEqual('a')
  })
})
