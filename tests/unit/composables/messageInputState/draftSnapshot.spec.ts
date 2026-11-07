import { reactive, ref } from 'vue'

import { createPinia, disposePinia, setActivePinia } from 'pinia'

import useMessageInputState from '/@/composables/messageInputState/useMessageInputState'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'
import type { MessageInputState } from '/@/store/ui/messageInputStateStore'

vi.mock('/@/composables/storage/useIndexedDbValue', () => ({
  default: (
    _name: string,
    _version: number,
    _migrations: unknown,
    initial: object
  ) => [reactive(initial), ref(false), Promise.resolve()]
}))

vi.mock('/@/store/entities/channels', () => ({
  useChannelsStore: () => ({ channelsMap: ref(new Map()) })
}))

let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

afterEach(() => disposePinia(pinia))

it('protects draft versions from mutation through a returned view or retained update', () => {
  const store = useMessageInputStateStore()
  const input = { text: 'first', attachments: [] }
  store.replaceDraft('channel', input)
  input.text = 'outside mutation'
  expect(store.getDraft('channel')?.text).toBe('first')

  const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const view = store.getDraft('channel')
  if (!view) throw new Error('Missing draft')
  Reflect.set(view, 'text', 'bypass')
  expect(store.getDraft('channel')?.text).toBe('first')
  warning.mockRestore()

  let retained: MessageInputState | undefined
  store.updateDraft('channel', draft => {
    draft.text = 'second'
    retained = draft
  })
  if (!retained) throw new Error('Missing update')
  retained.text = 'late mutation'
  retained.attachments.push({ file: new File([], 'late'), type: 'file' })
  expect(store.getDraft('channel')).toEqual({ text: 'second', attachments: [] })
})

it('consumes only the submitted text and attachments', () => {
  const store = useMessageInputStateStore()
  const sent = new File(['sent'], 'sent.txt')
  const next = new File(['next'], 'next.txt')

  store.replaceDraft('channel', {
    text: 'sent',
    attachments: [{ file: sent, type: 'file' }]
  })

  const snapshot = store.captureDraftSnapshot('channel')

  store.updateDraft('channel', draft => {
    draft.text = 'next'
    draft.attachments.push({ file: next, type: 'file' })
  })
  store.consumeSnapshot(snapshot)

  expect(snapshot.state.text).toBe('sent')
  expect(store.getDraft('channel')).toEqual({
    text: 'next',
    attachments: [{ file: next, type: 'file' }]
  })
})

it('changes document identity only when the submitted text is consumed', () => {
  const store = useMessageInputStateStore()
  store.replaceDraft('channel', { text: 'sent', attachments: [] })

  const key = store.getDocumentKey('channel')
  store.consumeSnapshot(store.captureDraftSnapshot('channel'))

  expect(store.getDraft('channel')).toBeUndefined()
  expect(store.getDocumentKey('channel')).not.toBe(key)
})

it('preserves a newer draft even when its text matches the snapshot again', () => {
  const store = useMessageInputStateStore()
  store.replaceDraft('channel', { text: 'same', attachments: [] })

  const snapshot = store.captureDraftSnapshot('channel')
  const key = store.getDocumentKey('channel')

  store.updateDraft('channel', draft => {
    draft.text = 'changed'
  })
  store.updateDraft('channel', draft => {
    draft.text = 'same'
  })
  store.consumeSnapshot(snapshot)

  expect(store.getDraft('channel')?.text).toBe('same')
  expect(store.getDocumentKey('channel')).toBe(key)
})

it('shares draft updates synchronously and keeps channel drafts separate', () => {
  const key = ref('first')
  const first = useMessageInputState(key)
  const second = useMessageInputState('first')

  first.state.text = 'first draft'
  expect(second.state.text).toBe('first draft')

  key.value = 'second'
  first.state.text = 'second draft'

  expect(second.state.text).toBe('first draft')
  expect(first.state.text).toBe('second draft')
  expect(first.documentKey.value).not.toBe(second.documentKey.value)
})
