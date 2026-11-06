import { ref } from 'vue'

import { flushPromises } from '@vue/test-utils'

import useLatestRequest from '/@/composables/utils/useLatestRequest'

import { withSetup } from '../../testUtils'

const disposers: Array<() => void> = []

const create = (autoLoad = false) => {
  const source = ref('first')

  const fetch = vi.fn<(source: string, signal: AbortSignal) => Promise<string>>(
    async source => source
  )

  const apply = vi.fn()
  const onError = vi.fn()

  const [query, { unmount }] = withSetup(() =>
    useLatestRequest({
      source,
      fetch,
      onSuccess: apply,
      onError,
      autoLoad
    })
  )()

  disposers.push(unmount)

  return { query, source, fetch, apply, onError, unmount }
}

afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

it('cancels an earlier execution and applies only the newest result', async () => {
  const pending = Promise.withResolvers<string>()
  const { query, fetch, apply } = create()
  fetch.mockReturnValueOnce(pending.promise).mockResolvedValueOnce('new')

  const old = query.execute()
  const oldSignal = fetch.mock.calls[0]?.[1]

  await expect(query.execute()).resolves.toBe('new')

  expect(oldSignal?.aborted).toBe(true)
  await expect(old).resolves.toBeUndefined()

  pending.resolve('old')
  await flushPromises()

  expect(apply).toHaveBeenCalledExactlyOnceWith('new', 'first')
})

it('keeps an execution started by an abort listener as the newest request', async () => {
  const pending = Promise.withResolvers<string>()
  const { query, fetch, apply } = create()

  fetch
    .mockImplementationOnce((_, signal) => {
      signal.addEventListener(
        'abort',
        () => {
          void query.execute()
        },
        { once: true }
      )
      return pending.promise
    })
    .mockResolvedValue('newest')

  const first = query.execute()
  await query.execute()
  await first
  await flushPromises()

  expect(fetch).toHaveBeenCalledTimes(2)
  expect(apply).toHaveBeenCalledExactlyOnceWith('newest', 'first')
  expect(query.isLoading.value).toBe(false)

  pending.resolve('old')
})

it('invalidates synchronously even when the source changes back before Vue flushes', async () => {
  const pending = Promise.withResolvers<string>()
  const { query, source, fetch, apply } = create()
  fetch.mockReturnValueOnce(pending.promise)

  const old = query.execute()
  source.value = 'second'
  source.value = 'first'

  pending.resolve('old')
  await old

  expect(apply).not.toHaveBeenCalled()
  expect(query.isLoading.value).toBe(false)
})

it('does not apply a result invalidated while its async callback is returning', async () => {
  const pending = Promise.withResolvers<string>()
  const { query, source, fetch, apply } = create()
  fetch.mockImplementationOnce(async () => await pending.promise)

  const old = query.execute()
  pending.resolve('old')
  queueMicrotask(() => {
    source.value = 'second'
  })

  await old

  expect(apply).not.toHaveBeenCalled()
})

it('finishes a cancelled call without waiting for a replacement request', async () => {
  const first = Promise.withResolvers<string>()
  const second = Promise.withResolvers<string>()
  const { query, fetch, apply } = create()

  fetch.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

  const old = query.execute()
  query.reset()
  const current = query.execute()

  await expect(old).resolves.toBeUndefined()

  expect(query.isLoading.value).toBe(true)

  first.resolve('old')
  await flushPromises()

  expect(query.isLoading.value).toBe(true)
  expect(apply).not.toHaveBeenCalled()

  second.resolve('new')
  await current

  expect(query.isLoading.value).toBe(false)
  expect(apply).toHaveBeenCalledExactlyOnceWith('new', 'first')
})

it('applies the result before releasing the loading state', async () => {
  const { query, apply } = create()

  apply.mockImplementation(() => {
    expect(query.isLoading.value).toBe(true)
  })

  await query.execute()

  expect(apply).toHaveBeenCalledOnce()
  expect(query.isLoading.value).toBe(false)
})

it('ignores cancelled failures and records current errors before a successful retry', async () => {
  const pending = Promise.withResolvers<string>()
  const { query, fetch, onError } = create()
  const error = new Error('offline')

  fetch
    .mockReturnValueOnce(pending.promise)
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce('recovered')

  const old = query.execute()
  await expect(query.execute()).rejects.toBe(error)

  pending.reject(new Error('old failure'))
  await old

  expect(onError).toHaveBeenCalledExactlyOnceWith(error)
  expect(query.error.value).toBe(error)
  expect(query.isLoading.value).toBe(false)

  await expect(query.execute()).resolves.toBe('recovered')

  expect(query.error.value).toBeUndefined()
})

it('fetches automatically and follows source changes', async () => {
  const { query, source, fetch, apply } = create(true)
  await flushPromises()

  expect(apply).toHaveBeenLastCalledWith('first', 'first')

  source.value = 'second'
  await flushPromises()

  expect(apply).toHaveBeenLastCalledWith('second', 'second')

  await query.execute()

  expect(fetch.mock.calls.map(([source]) => source)).toEqual([
    'first',
    'second',
    'second'
  ])
})

it('does not start manual queries when only the source changes', async () => {
  const { source, fetch } = create()
  source.value = 'second'
  await flushPromises()

  expect(fetch).not.toHaveBeenCalled()
})

it('cancels on disposal and refuses subsequent executions', async () => {
  const pending = Promise.withResolvers<string>()
  const { query, fetch, apply, unmount } = create()
  fetch.mockReturnValueOnce(pending.promise)

  const old = query.execute()
  const signal = fetch.mock.calls[0]?.[1]
  unmount()
  disposers.pop()

  expect(signal?.aborted).toBe(true)
  expect(query.isLoading.value).toBe(false)

  pending.resolve('old')
  await old
  await query.execute()

  expect(apply).not.toHaveBeenCalled()
  expect(fetch).toHaveBeenCalledOnce()
})
