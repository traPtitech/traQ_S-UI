import { nextFrame, wait } from '/@/lib/basic/timer'

describe('wait', () => {
  it('can wait', async () => {
    const before = Date.now()
    const p = wait(100)
    await expect(p).resolves.toBeUndefined()
    const after = Date.now()

    expect(after - before).toBeGreaterThanOrEqual(100 - 1) // 精度の問題か99になることがある
  })
})

describe('nextFrame', () => {
  beforeEach(() => {
    const spy = vi.spyOn(global, 'requestAnimationFrame')
    spy.mockClear()
  })

  it('can wait', async () => {
    const p = nextFrame()

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(requestAnimationFrame).toHaveBeenLastCalledWith(expect.any(Function))

    await expect(p).resolves.toEqual(expect.any(Number))
  })
})
