import { effectScope, nextTick, ref, unref } from 'vue'

import useMessageInputStateAttachment from '/@/composables/messageInputState/useMessageInputStateAttachment'
import { getResizedFile } from '/@/lib/resize'
import { useMessageInputStateStore } from '/@/store/ui/messageInputStateStore'

vi.mock('/@/lib/resize', () => ({ getResizedFile: vi.fn() }))
vi.mock('/@/store/ui/messageInputStateStore', async () => {
  const { reactive, unref } = await import('vue')
  const values = reactive(new Map())

  return {
    createDefaultValue: () => ({ text: '', attachments: [] }),
    useMessageInputStateStore: () => ({
      getStore: (key: unknown) => values.get(unref(key)),
      setStore: (key: unknown, value: unknown) => values.set(unref(key), value)
    })
  }
})

it('keeps a pending batch and later files in its starting draft', async () => {
  const { getStore, setStore } = useMessageInputStateStore()
  setStore('first', { text: 'first draft', attachments: [] })
  setStore('second', { text: 'second draft', attachments: [] })
  const key = ref('first')
  const scope = effectScope()
  const error = vi.fn()
  const input = scope.run(() => useMessageInputStateAttachment(key, error))
  if (!input) throw new Error('Missing input state')
  const pending = Promise.withResolvers<File>()
  const first = new File(['first'], 'first.txt', { type: 'text/plain' })
  const second = new File(['second'], 'second.txt', { type: 'text/plain' })
  vi.mocked(getResizedFile)
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(second)

  try {
    const uploading = input.addAttachments([first, second])
    await nextTick()
    key.value = 'second'
    await nextTick()
    pending.resolve(first)
    await uploading
    await nextTick()

    expect(
      getStore('first')?.attachments.map(attachment => attachment.file.name)
    ).toEqual(['first.txt', 'second.txt'])
    expect(getStore(unref(key))).toMatchObject({
      text: 'second draft',
      attachments: []
    })
    expect(error).not.toHaveBeenCalled()
  } finally {
    scope.stop()
  }
})

it('captures the target before asynchronous clipboard files are available', async () => {
  const { getStore, setStore } = useMessageInputStateStore()
  setStore('first', { text: 'first', attachments: [] })
  setStore('second', { text: 'second', attachments: [] })
  const key = ref('first')
  const scope = effectScope()
  const input = scope.run(() => useMessageInputStateAttachment(key, vi.fn()))
  if (!input) throw new Error('Missing input state')
  const files = Promise.withResolvers<File[]>()
  const file = new File(['svg'], 'image.svg', { type: 'image/svg+xml' })
  vi.mocked(getResizedFile).mockResolvedValue(file)

  try {
    const pending = input.addAttachments(files.promise)
    key.value = 'second'
    await nextTick()
    files.resolve([file])
    await pending
    expect(getStore('first')?.attachments).toHaveLength(1)
    expect(getStore('second')?.attachments).toHaveLength(0)
  } finally {
    scope.stop()
  }
})
