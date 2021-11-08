import { rAF, wait } from '/@/lib/basic/timer'

jest.useFakeTimers()

describe('wait', () => {
  beforeEach(() => {
    const spy = jest.spyOn(global, 'setTimeout')
    spy.mockClear()
  })

  it('can wait', async () => {
    const p = wait(1000)

    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)

    jest.runAllTimers()
    await expect(p).resolves.toBeUndefined()
  })
})

describe('rAF', () => {
  beforeEach(() => {
    const spy = jest.spyOn(global, 'requestAnimationFrame')
    spy.mockClear()
  })

  it('can wait', async () => {
    const p = rAF()

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(requestAnimationFrame).toHaveBeenLastCalledWith(expect.any(Function))

    jest.runAllTimers()
    await expect(p).resolves.toEqual(expect.any(Number))
  })
})
