import { reactive, ref } from 'vue'

import { createPinia, disposePinia, setActivePinia } from 'pinia'

import useMessageInputState from '/@/composables/messageInputState/useMessageInputState'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

vi.mock('/@/composables/storage/useIndexedDbValue', () => ({
  default: (
    _name: string,
    _version: number,
    _migrations: unknown,
    initial: object
  ) => [reactive(initial)]
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

it('consumes only the submitted text and attachments', () => {
  const store = useMessageInputStateStore()
  const sent = new File(['sent'], 'sent.txt')
  const next = new File(['next'], 'next.txt')

  store.setStore('channel', {
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
  expect(store.getStore('channel')).toEqual({
    text: 'next',
    attachments: [{ file: next, type: 'file' }]
  })
})

it('changes document identity only when the submitted text is consumed', () => {
  const store = useMessageInputStateStore()
  store.setStore('channel', { text: 'sent', attachments: [] })

  const key = store.getDocumentKey('channel')
  store.consumeSnapshot(store.captureDraftSnapshot('channel'))

  expect(store.getStore('channel')).toBeUndefined()
  expect(store.getDocumentKey('channel')).not.toBe(key)
})

it('preserves a newer draft even when its text matches the snapshot again', () => {
  const store = useMessageInputStateStore()
  store.setStore('channel', { text: 'same', attachments: [] })

  const snapshot = store.captureDraftSnapshot('channel')
  const key = store.getDocumentKey('channel')

  store.updateDraft('channel', draft => {
    draft.text = 'changed'
  })
  store.updateDraft('channel', draft => {
    draft.text = 'same'
  })
  store.consumeSnapshot(snapshot)

  expect(store.getStore('channel')?.text).toBe('same')
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
