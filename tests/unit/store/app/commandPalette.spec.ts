import { reactive } from 'vue'

import { createPinia, disposePinia } from 'pinia'

import type { ResolvedSearchQuery } from '/@/lib/searchMessage/queryParser'
import { useCommandPalette } from '/@/store/app/commandPalette'

const mocks = vi.hoisted(() => ({ parse: vi.fn(), error: vi.fn() }))

vi.mock('/@/composables/searchMessage/useQueryParser', () => ({
  default: () => ({ parseQuery: mocks.parse })
}))
vi.mock('/@/store/ui/toast', () => ({
  useToastStore: () => ({ addErrorToast: mocks.error })
}))
vi.mock('/@/composables/storage/useIndexedDbValue', () => ({
  default: (
    _name: string,
    _version: number,
    _migrations: unknown,
    initial: object
  ) => [reactive(initial)]
}))

const piniaInstances: ReturnType<typeof createPinia>[] = []

const create = () => {
  const pinia = createPinia()
  piniaInstances.push(pinia)
  return useCommandPalette(pinia)
}

const result = (id: string): ResolvedSearchQuery => ({
  serializedQuery: id,
  queryObject: { from: [id] }
})

beforeEach(() => {
  mocks.parse.mockReset()
  mocks.error.mockReset()
})

afterEach(() => {
  piniaInstances.splice(0).forEach(disposePinia)
})

it('keeps only the newest resolution even when the input text is identical', async () => {
  const older = Promise.withResolvers<ResolvedSearchQuery>()

  mocks.parse
    .mockReturnValueOnce(older.promise)
    .mockResolvedValueOnce(result('new-id'))

  const palette = create()
  palette.currentInput.value = 'from:alice'
  const first = palette.settleQuery()
  await palette.settleQuery()
  older.resolve(result('old-id'))
  await first
  expect(palette.searchRequest.value).toEqual(result('new-id'))
  expect(palette.query.value).toBe('new-id')
})

it('invalidates a pending resolution when input changes and changes back', async () => {
  const pending = Promise.withResolvers<ResolvedSearchQuery>()
  mocks.parse.mockReturnValue(pending.promise)
  const palette = create()
  palette.currentInput.value = 'from:alice'
  const request = palette.settleQuery()
  palette.currentInput.value = 'from:bob'
  palette.currentInput.value = 'from:alice'
  pending.resolve(result('stale'))
  await request
  expect(palette.searchRequest.value).toBeUndefined()
})

it('suppresses obsolete errors and reports the current resolution error', async () => {
  const pending = Promise.withResolvers<ResolvedSearchQuery>()

  mocks.parse
    .mockReturnValueOnce(pending.promise)
    .mockRejectedValueOnce(new Error('unresolved'))

  const palette = create()
  const first = palette.settleQuery()
  palette.currentInput.value = 'in:here'
  await palette.settleQuery()
  pending.reject(new Error('old error'))
  await first
  expect(mocks.error).toHaveBeenCalledOnce()
  expect(palette.searchRequest.value).toBeUndefined()
})
