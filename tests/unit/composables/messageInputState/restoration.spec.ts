import { nextTick, ref } from 'vue'

import type * as idb from 'idb-keyval'
import { createPinia, disposePinia } from 'pinia'

import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

const storage = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  error: vi.fn()
}))

vi.mock('idb-keyval', async importOriginal => ({
  ...(await importOriginal<typeof idb>()),
  get: storage.get,
  set: storage.set
}))
vi.mock('/@/lib/storage/indexedDb', () => ({
  createStoreWithMigrations: vi.fn()
}))
vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({ channelsMap: ref(new Map()) })
}))
vi.mock('/@/store/ui/toast', () => ({
  useToastStore: () => ({ addErrorToast: storage.error })
}))

const draft = (text: string) => ({ text, attachments: [] })
let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  pinia = createPinia()
  storage.set.mockResolvedValue(undefined)
})

afterEach(() => disposePinia(pinia))

it('merges saved drafts without replacing input or restoring deleted drafts', async () => {
  const pending = Promise.withResolvers<object>()
  storage.get.mockReturnValueOnce(pending.promise)
  const store = useMessageInputStateStore(pinia)

  store.replaceDraft('edited', draft('new input'))
  store.replaceDraft('deleted', draft(''))
  await nextTick()

  expect(store.restorationState.value).toBe('restoring')
  expect(storage.set).not.toHaveBeenCalled()

  pending.resolve({
    messageInputState: new Map([
      ['edited', draft('old input')],
      ['deleted', draft('deleted input')],
      ['untouched', draft('saved input')]
    ])
  })
  await store.restoringPromise
  await nextTick()

  expect(store.restorationState.value).toBe('ready')
  expect(store.getDraft('edited')?.text).toBe('new input')
  expect(store.getDraft('deleted')).toBeUndefined()
  expect(store.getDraft('untouched')?.text).toBe('saved input')
  expect(storage.set).toHaveBeenCalledWith(
    'key',
    {
      messageInputState: new Map([
        ['edited', draft('new input')],
        ['untouched', draft('saved input')]
      ])
    },
    undefined
  )
})

it('persists input made during restoration when no saved drafts exist', async () => {
  const pending = Promise.withResolvers<undefined>()
  storage.get.mockReturnValueOnce(pending.promise)
  const store = useMessageInputStateStore(pinia)

  store.replaceDraft('channel', draft('first draft'))
  await nextTick()
  expect(storage.set).not.toHaveBeenCalled()

  pending.resolve(undefined)
  await store.restoringPromise
  await nextTick()

  expect(store.restorationState.value).toBe('ready')
  expect(storage.set).toHaveBeenCalledWith(
    'key',
    { messageInputState: new Map([['channel', draft('first draft')]]) },
    undefined
  )
})

it('keeps live input and prevents persistence when restoration fails', async () => {
  const pending = Promise.withResolvers<object>()
  storage.get.mockReturnValueOnce(pending.promise)
  const store = useMessageInputStateStore(pinia)

  store.replaceDraft('channel', draft('new input'))
  const failure = new Error('storage unavailable')
  pending.reject(failure)
  await expect(store.restoringPromise).rejects.toBe(failure)
  store.replaceDraft('channel', draft('continued input'))
  await nextTick()

  expect(store.restorationState.value).toBe('error')
  expect(store.getDraft('channel')?.text).toBe('continued input')
  expect(storage.set).not.toHaveBeenCalled()
  expect(storage.error).toHaveBeenCalledOnce()
})
