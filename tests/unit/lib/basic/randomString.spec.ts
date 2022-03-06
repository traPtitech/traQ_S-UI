import { randomString } from '/@/lib/basic/randomString'

describe('randomString', () => {
  it('should work', () => {
    const random = vi.spyOn(Math, 'random')
    random.mockReturnValueOnce(0.1)

    const actual1 = randomString()
    expect(actual1).toBe('36cpj6cpj6d')

    random.mockReturnValueOnce(0.2)

    const actual2 = randomString()
    expect(actual2).toBe('6cpj6cpj6cq')
  })
})
