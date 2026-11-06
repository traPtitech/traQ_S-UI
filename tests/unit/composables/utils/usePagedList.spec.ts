import { ref } from 'vue'

import { flushPromises } from '@vue/test-utils'

import usePagedList, {
  type ListPage,
  type PageLoader
} from '/@/composables/utils/usePagedList'

import { withSetup } from '../../testUtils'

const disposers: Array<() => void> = []

const page = (items: string[], cursor: number): ListPage<string, number> => ({
  items,
  cursor
})

type Loader = PageLoader<string, number, string>

const create = (
  options: {
    prepare?: (items: string[]) => Promise<void>
    catchUp?: Loader
    ready?: Promise<void>
  } = {}
) => {
  const source = ref('first')
  const previous = vi.fn<Loader>(async () => page([], 0))
  const next = vi.fn<Loader>(async () => page([], 0))
  const around = vi.fn<Loader>(async () => page([], 0))
  const [list, { unmount }] = withSetup(() =>
    usePagedList({
      source,
      initialCursor: () => 0,
      key: item => item,
      autoLoad: false,
      prepare: options.prepare,
      ready: options.ready,
      load: { previous, next, around, catchUp: options.catchUp }
    })
  )()

  disposers.push(unmount)

  return { list, source, previous, next, around, unmount }
}

afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

it('reports the latest boundary only after the initial page has been prepared', async () => {
  const pending = Promise.withResolvers<ListPage<string, number>>()
  const { list, previous } = create()
  previous.mockReturnValueOnce(pending.promise)
  const loading = list.init()

  expect(list.reachedEnd.value).toBe(false)
  expect(list.isCaughtUp.value).toBe(false)

  pending.resolve(page(['latest'], 1))
  await loading

  expect(list.reachedEnd.value).toBe(true)
  expect(list.isCaughtUp.value).toBe(true)
})

it.each(['previous', 'next'] as const)(
  'recovers the initial latest page through %s pagination',
  async direction => {
    const { list, previous } = create()
    previous
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page(['latest'], 1))
    await expect(list.init()).rejects.toThrow('offline')
    await list.load(direction)

    expect(list.items.value).toEqual(['latest'])
    expect(list.lastLoadKind.value).toBe('latest')
    expect(list.isCaughtUp.value).toBe(true)
  }
)

it('recovers an invalidated latest boundary through newer pagination', async () => {
  const catchUp = vi.fn<Loader>(async () => ({
    ...page(['recovered'], 1),
    reachedEnd: true
  }))
  const { list } = create({ catchUp })
  await list.init()
  list.invalidateLatest()

  expect(list.isCaughtUp.value).toBe(false)
  expect(list.reachedEnd.value).toBe(true)

  await list.load('next')

  expect(list.items.value).toEqual(['recovered'])
  expect(list.isCaughtUp.value).toBe(true)
})

it('prepends, appends and replaces generic items while preserving order and removing duplicates', async () => {
  const { list, previous, next, around } = create()
  previous.mockResolvedValueOnce(page(['b', 'c'], 1))
  await list.load('previous')
  previous.mockResolvedValueOnce(page(['a', 'b'], 2))
  await list.load('previous')
  next.mockResolvedValueOnce(page(['c', 'd'], 3))
  await list.load('next')

  expect(list.items.value).toEqual(['a', 'b', 'c', 'd'])
  expect(list.cursor.value).toBe(3)

  around.mockResolvedValueOnce(page(['x', 'x', 'y'], 4))
  await list.load('around')

  expect(list.items.value).toEqual(['x', 'y'])
  expect(list.lastLoadKind.value).toBe('around')
})

it('ignores a stale page and its cursor and end flags after a reset', async () => {
  const { list, previous } = create()
  const pending = Promise.withResolvers<ListPage<string, number>>()

  previous
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(page(['current'], 2))

  const old = list.load('previous')
  list.reset()
  await list.load('previous')

  pending.resolve({
    ...page(['old'], 99),
    reachedStart: true,
    reachedEnd: true
  })

  await old

  expect(list.items.value).toEqual(['current'])
  expect(list.cursor.value).toBe(2)
  expect(list.reachedStart.value).toBe(false)
  expect(list.reachedEnd.value).toBe(false)
})

it('stops at reached ends and does not run unsupported loaders', async () => {
  const { list, previous, next } = create()
  previous.mockResolvedValueOnce({ ...page(['a'], 1), reachedStart: true })
  next.mockResolvedValueOnce({ ...page(['b'], 2), reachedEnd: true })
  await list.load('previous')
  await list.load('previous')
  await list.load('next')
  await list.load('next')
  await list.requestCatchUp()
  await flushPromises()

  expect(previous).toHaveBeenCalledTimes(1)
  expect(next).toHaveBeenCalledTimes(1)
  expect(list.items.value).toEqual(['a', 'b'])
})

it('commits the items, cursor and end flags only after preparation succeeds', async () => {
  const pending = Promise.withResolvers<void>()
  const { list, previous } = create({ prepare: () => pending.promise })

  previous.mockResolvedValueOnce({
    ...page(['prepared'], 1),
    reachedStart: true,
    reachedEnd: true
  })

  const request = list.load('previous')
  await flushPromises()

  expect(list.items.value).toEqual([])
  expect(list.cursor.value).toBe(0)
  expect(list.reachedStart.value).toBe(false)
  expect(list.reachedEnd.value).toBe(false)

  pending.resolve()
  await request

  expect(list.items.value).toEqual(['prepared'])
  expect(list.cursor.value).toBe(1)
  expect(list.reachedStart.value).toBe(true)
  expect(list.reachedEnd.value).toBe(true)
})

it('retries the same cursor after preparation fails on a terminal page', async () => {
  const prepare = vi
    .fn<(items: string[]) => Promise<void>>()
    .mockRejectedValueOnce(new Error('render failed'))
    .mockResolvedValue(undefined)

  const { list, previous } = create({ prepare })
  previous.mockResolvedValue({ ...page(['retried'], 1), reachedStart: true })

  await expect(list.load('previous')).rejects.toThrow('render failed')

  expect(list.items.value).toEqual([])
  expect(list.cursor.value).toBe(0)
  expect(list.reachedStart.value).toBe(false)

  await list.load('previous')

  expect(previous.mock.calls.map(([context]) => context.cursor)).toEqual([0, 0])
  expect(list.items.value).toEqual(['retried'])
  expect(list.reachedStart.value).toBe(true)
})

it('permits another catchUp and preserves the latest flag after a catchUp failure', async () => {
  const catchUp = vi
    .fn<Loader>()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ ...page(['recovered'], 1), reachedEnd: true })

  const { list } = create({ catchUp })
  await list.init()

  await expect(list.requestCatchUp()).rejects.toThrow('offline')

  expect(list.reachedEnd.value).toBe(true)
  expect(list.cursor.value).toBe(0)
  expect(list.items.value).toEqual([])

  await list.requestCatchUp()

  expect(catchUp.mock.calls.map(([context]) => context.cursor)).toEqual([0, 0])
  expect(list.items.value).toEqual(['recovered'])
  expect(list.reachedEnd.value).toBe(true)
  expect(list.error.value).toBeUndefined()
})

it('keeps the missing latest range after an unrelated page succeeds', async () => {
  const catchUp = vi
    .fn<Loader>()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ ...page(['new'], 2), reachedEnd: true })
  const { list, previous } = create({ catchUp })
  await list.init()
  await expect(list.requestCatchUp()).rejects.toThrow('offline')

  previous.mockResolvedValueOnce(page(['old'], 1))
  await list.load('previous')

  expect(list.error.value).toBeUndefined()
  expect(list.needsCatchUp.value).toBe(true)

  await list.requestCatchUp()

  expect(list.needsCatchUp.value).toBe(false)
})

it('keeps a partially recovered gap until newer pagination reaches the end', async () => {
  const catchUp = vi.fn<Loader>(async () => ({
    ...page(['new'], 1),
    reachedEnd: false
  }))
  const { list, next } = create({ catchUp })
  await list.init()
  await list.requestCatchUp()

  expect(list.needsCatchUp.value).toBe(true)

  next.mockResolvedValueOnce({ ...page(['latest'], 2), reachedEnd: true })
  await list.load('next')

  expect(list.needsCatchUp.value).toBe(false)
})

it('does not commit page state if reset occurs during preparation', async () => {
  const pending = Promise.withResolvers<void>()
  const { list, previous } = create({ prepare: () => pending.promise })

  previous.mockResolvedValueOnce({
    ...page(['obsolete'], 99),
    reachedStart: true
  })

  const request = list.load('previous')
  await flushPromises()
  list.reset()
  pending.resolve()
  await request

  expect(list.items.value).toEqual([])
  expect(list.cursor.value).toBe(0)
  expect(list.reachedStart.value).toBe(false)
})

it('resolves the current page without waiting for a queued catchUp', async () => {
  const initial = Promise.withResolvers<ListPage<string, number>>()
  const pendingRefresh = Promise.withResolvers<ListPage<string, number>>()
  const catchUp = vi.fn<Loader>(() => pendingRefresh.promise)
  const { list, previous } = create({ catchUp })
  previous.mockReturnValueOnce(initial.promise)

  let settled = false

  const current = list.init().then(result => {
    settled = true

    return result
  })

  await list.requestCatchUp()
  initial.resolve(page(['initial'], 1))
  await flushPromises()

  const settledBeforeRefresh = settled

  expect(catchUp).toHaveBeenCalledTimes(1)
  expect(list.items.value).toEqual(['initial'])
  expect(list.isLoading.value).toBe(true)

  pendingRefresh.resolve({ ...page(['new'], 2), reachedEnd: true })
  await current
  await flushPromises()

  expect(settledBeforeRefresh).toBe(true)
  expect(list.items.value).toEqual(['initial', 'new'])
})

it('keeps a queued catchUp failure separate from a successful page result', async () => {
  const initial = Promise.withResolvers<ListPage<string, number>>()
  const pendingRefresh = Promise.withResolvers<ListPage<string, number>>()
  const catchUp = vi.fn<Loader>(() => pendingRefresh.promise)
  const { list, previous } = create({ catchUp })
  previous.mockReturnValueOnce(initial.promise)

  const current = list.init().then(
    result => ({ result }),
    error => ({ error })
  )

  await list.requestCatchUp()
  const initialPage = page(['initial'], 1)
  initial.resolve(initialPage)
  await flushPromises()

  const error = new Error('catchUp failed')
  pendingRefresh.reject(error)
  await flushPromises()

  await expect(current).resolves.toEqual({ result: initialPage })

  expect(list.items.value).toEqual(['initial'])
  expect(list.error.value).toBe(error)
  expect(list.isLoading.value).toBe(false)
})

it('does not replace the original page error with a queued catchUp error', async () => {
  const initial = Promise.withResolvers<ListPage<string, number>>()
  const pendingRefresh = Promise.withResolvers<ListPage<string, number>>()
  const catchUp = vi.fn<Loader>(() => pendingRefresh.promise)
  const { list, previous } = create({ catchUp })
  await list.init()
  previous.mockReturnValueOnce(initial.promise)

  const current = list.init().then(
    result => ({ result }),
    error => ({ error })
  )

  await list.requestCatchUp()

  const originalError = new Error('page failed')
  initial.reject(originalError)
  await flushPromises()

  const refreshError = new Error('catchUp failed')
  pendingRefresh.reject(refreshError)
  await flushPromises()

  await expect(current).resolves.toEqual({ error: originalError })

  expect(list.items.value).toEqual([])
  expect(list.error.value).toBe(refreshError)
  expect(list.isLoading.value).toBe(false)
})

it('does not fetch a page invalidated while readiness is resolving', async () => {
  const pending = Promise.withResolvers<void>()

  const { list, source, previous } = create({
    ready: pending.promise.then(() => undefined)
  })

  const request = list.load('previous')
  pending.resolve()

  queueMicrotask(() => {
    source.value = 'next'
  })

  await request

  expect(previous).not.toHaveBeenCalled()
})

it('does not prepare a page invalidated while the loader is returning', async () => {
  const pending = Promise.withResolvers<ListPage<string, number>>()
  const prepare = vi.fn(async () => undefined)
  const { list, source, previous } = create({ prepare })
  previous.mockImplementationOnce(async () => await pending.promise)

  const request = list.load('previous')
  pending.resolve(page(['old'], 99))

  queueMicrotask(() => {
    source.value = 'next'
  })

  await request

  expect(prepare).not.toHaveBeenCalled()
  expect(list.items.value).toEqual([])
  expect(list.cursor.value).toBe(0)
})

it('does not apply a page invalidated while preparation is returning', async () => {
  const pending = Promise.withResolvers<void>()

  const { list, source, previous } = create({
    prepare: async () => await pending.promise
  })

  previous.mockResolvedValueOnce({ ...page(['old'], 99), reachedStart: true })

  const request = list.load('previous')
  await flushPromises()
  pending.resolve()

  queueMicrotask(() => {
    source.value = 'next'
  })

  await request

  expect(list.items.value).toEqual([])
  expect(list.cursor.value).toBe(0)
  expect(list.reachedStart.value).toBe(false)
})

it.each([true, false])(
  'decides a queued catchUp after the prepared page reports reachedEnd=%s',
  async reachedEnd => {
    const rendering = Promise.withResolvers<void>()
    const catchUp = vi.fn<Loader>(async () => page(['new'], 2))

    const prepare = vi
      .fn<(items: string[]) => Promise<void>>()
      .mockReturnValueOnce(rendering.promise)
      .mockResolvedValue(undefined)

    const { list, around } = create({ prepare, catchUp })
    around.mockResolvedValueOnce({ ...page(['target'], 1), reachedEnd })

    const request = list.load('around')
    await flushPromises()
    await list.requestCatchUp()

    expect(catchUp).not.toHaveBeenCalled()

    rendering.resolve()
    await request
    await flushPromises()

    expect(catchUp).toHaveBeenCalledTimes(reachedEnd ? 1 : 0)
    expect(list.items.value).toEqual(
      reachedEnd ? ['target', 'new'] : ['target']
    )
  }
)

it.each(['reset', 'source', 'unmount'] as const)(
  'releases queued refreshes on %s',
  async action => {
    const pending = Promise.withResolvers<ListPage<string, number>>()
    const catchUp = vi.fn<Loader>(async () => page(['new'], 1))
    const { list, source, previous, unmount } = create({ catchUp })
    previous.mockReturnValueOnce(pending.promise)

    const request = list.init()
    await list.requestCatchUp()

    if (action === 'reset') list.reset()
    else if (action === 'source') source.value = 'next'
    else {
      unmount()
      disposers.pop()
    }

    await request

    expect(list.isLoading.value).toBe(false)
    expect(catchUp).not.toHaveBeenCalled()
  }
)
