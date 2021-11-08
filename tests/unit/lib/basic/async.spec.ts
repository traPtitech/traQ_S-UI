import { createSingleflight } from '/@/lib/basic/async'

describe('createSingleFlight', () => {
  const createSff = () => {
    const counters = new Map<string, number>()

    const f = jest.fn((id: string) => {
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

  it('can be called twice parallely (1)', async () => {
    const { sff, f } = createSff()

    const [res1, res2] = await Promise.all([sff('1'), sff('1')])

    expect(res1).toStrictEqual([1, false])
    expect(res2).toStrictEqual([1, true])

    expect(f).toHaveBeenCalledTimes(1)
  })

  it('can be called twice parallely (2)', async () => {
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
