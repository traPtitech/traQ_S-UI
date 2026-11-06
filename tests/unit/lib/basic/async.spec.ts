import { flushPromises } from '@vue/test-utils'

import {
  createMutex,
  createOrderedTask,
  createSingleflight
} from '/@/lib/basic/async'

describe('createOrderedTask', () => {
  it('prepares in parallel and waits for earlier commits', async () => {
    const run = createOrderedTask()
    const pending = Promise.withResolvers<string>()
    const received: string[] = []
    const commit = (value: string) => {
      received.push(value)
    }
    const prepareSecond = vi.fn(async () => 'second')

    const first = run(() => pending.promise, commit)
    const second = run(prepareSecond, commit)
    await flushPromises()

    expect(prepareSecond).toHaveBeenCalledOnce()
    expect(received).toEqual([])

    pending.resolve('first')
    await Promise.all([first, second])

    expect(received).toEqual(['first', 'second'])
  })

  it('does not let a failed preparation release the tasks before it', async () => {
    const run = createOrderedTask()
    const pending = Promise.withResolvers<string>()
    const received: string[] = []
    const commit = (value: string) => {
      received.push(value)
    }
    const first = run(() => pending.promise, commit)
    const failed = run(async () => {
      throw new Error('failed')
    }, commit)
    const third = run(async () => 'third', commit)

    await expect(failed).rejects.toThrow('failed')
    expect(received).toEqual([])

    pending.resolve('first')
    await Promise.all([first, third])

    expect(received).toEqual(['first', 'third'])
  })

  it('releases later tasks when a commit fails', async () => {
    const run = createOrderedTask()
    const first = run(
      async () => 'first',
      () => {
        throw new Error('failed')
      }
    )
    const second = run(
      async () => 'second',
      value => value
    )

    await expect(first).rejects.toThrow('failed')
    await expect(second).resolves.toBe('second')
  })
})

describe('createSingleFlight', () => {
  const createSff = () => {
    const counters = new Map<string, number>()

    const f = vi.fn((id: string) => {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          if (!counters.has(id)) {
            counters.set(id, 0)
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const count = counters.get(id)! + 1
          counters.set(id, count)
          resolve(count)
        }, 100)
      })
    })
    const sff = createSingleflight(f)
    return { sff, f }
  }

  it('can be called once', async () => {
    const { sff, f } = createSff()

    const res = await sff('0')

    expect(res).toStrictEqual([1, false])

    expect(f).toHaveBeenCalledTimes(1)
  })

  it('can be called twice in parallel (1)', async () => {
    const { sff, f } = createSff()

    const [res1, res2] = await Promise.all([sff('1'), sff('1')])

    expect(res1).toStrictEqual([1, false])
    expect(res2).toStrictEqual([1, true])

    expect(f).toHaveBeenCalledTimes(1)
  })

  it('can be called twice in parallel (2)', async () => {
    const { sff, f } = createSff()

    const [res1, res2] = await Promise.all([sff('1'), sff('2')])

    expect(res1).toStrictEqual([1, false])
    expect(res2).toStrictEqual([1, false])

    expect(f).toHaveBeenCalledTimes(2)
  })

  it('can be called twice serially', async () => {
    const { sff, f } = createSff()

    const res1 = await sff('2')
    const res2 = await sff('2')

    expect(res1).toStrictEqual([1, false])
    expect(res2).toStrictEqual([2, false])

    expect(f).toHaveBeenCalledTimes(2)
  })

  it('can be called twice serially with first error', async () => {
    const { sff, f } = createSff()

    f.mockRejectedValueOnce('')

    let res1: [number, boolean] | undefined
    try {
      res1 = await sff('2')
    } catch {}
    const res2 = await sff('2')

    expect(res1).toBeUndefined()
    expect(res2).toStrictEqual([1, false])

    expect(f).toHaveBeenCalledTimes(2)
  })
})

describe('createMutex', () => {
  it('can be called', async () => {
    const mutex = createMutex()
    const lockPromise = mutex.lock()
    const unlockResult = mutex.unlock()

    await expect(lockPromise).resolves.toBeUndefined()
    await expect(unlockResult).toBeUndefined()
  })

  it('can be called serially', async () => {
    const mutex = createMutex()

    await mutex.lock()
    mutex.unlock()
    await mutex.lock()
    mutex.unlock()
  })

  it('can be called concurrently', async () => {
    const mutex = createMutex()
    let ran = 0

    const run = async (ms: number) => {
      await mutex.lock()

      await new Promise<void>(resolve => {
        setTimeout(() => {
          resolve()
        }, ms)
      })

      mutex.unlock()
      ran++
    }

    const before = Date.now()

    const p1 = run(20)
    const p2 = run(40)
    await Promise.all([p1, p2])

    const after = Date.now()

    expect(ran).toBe(2)
    expect(after - before).toBeGreaterThanOrEqual(20 + 40 - 2) // 2msまで短くなることを許容する
  })

  it('throws error when unlocking empty', () => {
    const mutex = createMutex()
    expect(() => {
      mutex.unlock()
    }).toThrow('mutex: tried to unlock unlocked mutex.')
  })

  it('throws error when unlocking unlocked', async () => {
    const mutex = createMutex()
    await expect(async () => {
      await mutex.lock()
      mutex.unlock()
      mutex.unlock()
    }).rejects.toThrow('mutex: tried to unlock unlocked mutex.')
  })
})
