import { getStringParam } from '/@/lib/util/params'

describe('getStringParam', () => {
  it('can get string param', () => {
    expect(getStringParam('str')).toEqual('str')
  })
  it('can get empty array param', () => {
    expect(getStringParam([])).toEqual(undefined)
  })
  it('can get null array param', () => {
    expect(getStringParam([null])).toEqual(undefined)
  })
  it('can get array param first element', () => {
    expect(getStringParam(['a', 'b'])).toEqual('a')
  })
})
