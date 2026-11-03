import useMessageInputStateStatic from '/@/composables/messageInputState/useMessageInputStateStatic'
import type { MessageInputState } from '/@/store/ui/messageInputStateStore'

const state = vi.hoisted(() => new Map<string, MessageInputState>())

vi.mock('/@/store/ui/messageInputStateStore', () => ({
  createDefaultValue: () => ({ text: '', attachments: [] }),
  useMessageInputStateStore: () => ({
    getStore: (key: string) => state.get(key),
    setStore: (key: string, value: MessageInputState) => state.set(key, value)
  })
}))

beforeEach(() => state.clear())

it('snapshots the draft and keeps text and attachments added while posting', () => {
  const firstFile = new File(['first'], 'first.txt')
  const nextFile = new File(['next'], 'next.txt')

  state.set('channel', {
    text: 'first',
    attachments: [{ file: firstFile, type: 'file' }]
  })

  const draft = useMessageInputStateStatic().getMessageInputState('channel')

  state.set('channel', {
    text: 'next',
    attachments: [
      { file: firstFile, type: 'file' },
      { file: nextFile, type: 'file' }
    ]
  })

  expect(draft.state.text).toBe('first')
  expect(draft.state.attachments).toHaveLength(1)
  draft.clearState()

  expect(state.get('channel')).toEqual({
    text: 'next',
    attachments: [{ file: nextFile, type: 'file' }]
  })
})

it('clears an unchanged draft after posting', () => {
  state.set('channel', { text: 'posted', attachments: [] })
  useMessageInputStateStatic().getMessageInputState('channel').clearState()
  expect(state.get('channel')).toEqual({ text: '', attachments: [] })
})
