import { thr } from '/@/foo'

describe('foo', () => {
  test('simple', () => {
    const a = 6
    const b = 3
    expect(a + b).toBe(10)
  })

  test('func', () => {
    thr()
  })
})
