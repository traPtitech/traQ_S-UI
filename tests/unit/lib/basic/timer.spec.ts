import { defer, nextFrame, wait } from '/@/lib/basic/timer'

describe('wait', () => {
  it('waits for specified milliseconds and resolves to undefined', async () => {
    const before = Date.now()
    const result = await wait(100)
    const after = Date.now()

    expect(result).toBeUndefined()
    expect(after - before).toBeGreaterThanOrEqual(100 - 1)
  })

  it('resolves immediately with 0ms', async () => {
    const before = Date.now()
    const result = await wait(0)
    const after = Date.now()

    expect(result).toBeUndefined()
    expect(after - before).toBeLessThan(50)
  })

  it('can be awaited multiple times sequentially', async () => {
    const before = Date.now()
    await wait(50)
    await wait(50)
    const after = Date.now()

    expect(after - before).toBeGreaterThanOrEqual(100 - 1)
  })

  it('can run concurrently with Promise.all', async () => {
    const before = Date.now()
    await Promise.all([wait(50), wait(50), wait(50)])
    const after = Date.now()

    expect(after - before).toBeGreaterThanOrEqual(50 - 1)
    expect(after - before).toBeLessThan(150)
  })
})

describe('nextFrame', () => {
  beforeEach(() => {
    vi.spyOn(global, 'requestAnimationFrame').mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls requestAnimationFrame', async () => {
    const p = nextFrame()

    expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(requestAnimationFrame).toHaveBeenLastCalledWith(expect.any(Function))

    await expect(p).resolves.toEqual(expect.any(Number))
  })

  it('resolves with timestamp from requestAnimationFrame', async () => {
    const result = await nextFrame()

    expect(typeof result).toBe('number')
  })

  it('can be called multiple times sequentially', async () => {
    await nextFrame()
    await nextFrame()

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
  })
})

describe('defer', () => {
  beforeEach(() => {
    vi.spyOn(global, 'requestAnimationFrame').mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns undefined when called without callback', async () => {
    await expect(defer()).resolves.toBeUndefined()
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('returns callback result when called with callback', async () => {
    const callback = vi.fn(() => 'result')

    await expect(defer(callback)).resolves.toBe('result')
    expect(callback).toHaveBeenCalledTimes(1)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('awaits and returns async callback result', async () => {
    const callback = vi.fn(async () => {
      await wait(10)
      return 'async result'
    })

    await expect(defer(callback)).resolves.toBe('async result')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('waits for two frames before executing callback', async () => {
    const callback = vi.fn(() => 42)

    await defer(callback)

    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('executes callback after frames, not before', async () => {
    let executed = false
    const callback = () => {
      executed = true
      return 'done'
    }

    const promise = defer(callback)

    await promise
    expect(executed).toBe(true)
  })

  it('returns different types from callback', async () => {
    expect(await defer(() => 123)).toBe(123)
    expect(await defer(() => 'string')).toBe('string')
    expect(await defer(() => ({ key: 'value' }))).toEqual({ key: 'value' })
    expect(await defer(() => [1, 2, 3])).toEqual([1, 2, 3])
    expect(await defer(() => null)).toBeNull()
  })

  it('handles callback that returns a promise', async () => {
    const asyncCallback = async () => {
      return Promise.resolve('resolved value')
    }

    await expect(defer(asyncCallback)).resolves.toBe('resolved value')
  })

  it('propagates errors from callback', async () => {
    const errorCallback = () => {
      throw new Error('callback error')
    }

    await expect(defer(errorCallback)).rejects.toThrow('callback error')
  })

  it('propagates errors from async callback', async () => {
    const asyncErrorCallback = async () => {
      throw new Error('async callback error')
    }

    await expect(defer(asyncErrorCallback)).rejects.toThrow(
      'async callback error'
    )
  })
})
