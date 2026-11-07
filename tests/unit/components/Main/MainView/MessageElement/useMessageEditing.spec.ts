import { nextTick, reactive, ref } from 'vue'

import { useMessageEditing } from '/@/components/Main/MainView/MessageElement/composables/useMessageEditing'
import apis from '/@/lib/apis'

import { withSetup } from '../../../../testUtils'

const mocks = vi.hoisted(() => ({ resize: vi.fn(), error: vi.fn() }))
vi.mock('/@/lib/resize', () => ({ getResizedFile: mocks.resize }))
vi.mock('/@/store/ui/toast', () => ({
  useToastStore: () => ({ addErrorToast: mocks.error })
}))

const disposers: Array<() => void> = []

const create = () => {
  const text = ref('original')
  const finish = vi.fn()

  const props = reactive({ messageId: 'message', channelId: 'channel' })
  const [editor, { unmount }] = withSetup(useMessageEditing)(
    props,
    text,
    finish
  )

  disposers.push(unmount)
  return { ...editor, text, finish, props, unmount }
}

beforeEach(() => {
  mocks.resize.mockReset()
  mocks.error.mockReset()
})

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
})

it('releases the upload lock after resizing fails and retries successfully', async () => {
  mocks.resize
    .mockRejectedValueOnce(new Error('resize failed'))
    .mockImplementation(async file => file)

  const upload = vi
    .spyOn(apis, 'postFile')
    .mockResolvedValue({ data: { id: 'file' } } as Awaited<
      ReturnType<typeof apis.postFile>
    >)

  const editor = create()
  const files = [new File(['data'], 'file.txt')]
  await editor.onAddAttachments(files)
  expect(editor.isBusy.value).toBe(false)
  expect(editor.text.value).toBe('original')
  expect(upload).not.toHaveBeenCalled()
  expect(mocks.error).toHaveBeenCalledOnce()
  await editor.onAddAttachments(files)
  expect(upload).toHaveBeenCalledOnce()
  expect(editor.text.value).toContain('/files/file')
  expect(editor.isBusy.value).toBe(false)
})

it('rejects duplicate saves and attachment insertion while saving', async () => {
  const response =
    Promise.withResolvers<Awaited<ReturnType<typeof apis.editMessage>>>()
  const save = vi.spyOn(apis, 'editMessage').mockReturnValue(response.promise)
  const editor = create()
  const pending = editor.editMessage()
  await editor.editMessage()
  await editor.onAddAttachments([new File(['data'], 'file.txt')])

  expect(save).toHaveBeenCalledExactlyOnceWith('message', {
    content: 'original'
  })
  expect(mocks.resize).not.toHaveBeenCalled()
  response.resolve({} as Awaited<ReturnType<typeof apis.editMessage>>)
  await pending
  expect(editor.finish).toHaveBeenCalledOnce()
  expect(editor.isBusy.value).toBe(false)
})

it('preserves text and releases the lock after a failed save', async () => {
  vi.spyOn(apis, 'editMessage').mockRejectedValue(new Error('offline'))
  const editor = create()
  await editor.editMessage()
  expect(editor.text.value).toBe('original')
  expect(editor.finish).not.toHaveBeenCalled()
  expect(editor.isBusy.value).toBe(false)
  expect(mocks.error).toHaveBeenCalledOnce()
})

it('does not append an upload to a different editing session', async () => {
  const resize = Promise.withResolvers<File>()
  mocks.resize.mockReturnValue(resize.promise)
  const upload = vi
    .spyOn(apis, 'postFile')
    .mockResolvedValue({ data: { id: 'file' } } as Awaited<
      ReturnType<typeof apis.postFile>
    >)
  const editor = create()
  const file = new File(['data'], 'file.txt')
  const pending = editor.onAddAttachments([file])
  await nextTick()
  editor.props.messageId = 'another-message'
  editor.text.value = 'another draft'
  resize.resolve(file)
  await pending
  expect(upload).not.toHaveBeenCalled()
  expect(editor.text.value).toBe('another draft')
  expect(editor.isBusy.value).toBe(false)
})

it('does not finish a new editing session when an earlier save completes', async () => {
  const response =
    Promise.withResolvers<Awaited<ReturnType<typeof apis.editMessage>>>()
  vi.spyOn(apis, 'editMessage').mockReturnValue(response.promise)
  const editor = create()
  const pending = editor.editMessage()
  editor.props.messageId = 'another-message'
  response.resolve({} as Awaited<ReturnType<typeof apis.editMessage>>)
  await pending
  expect(editor.finish).not.toHaveBeenCalled()
  expect(editor.isBusy.value).toBe(false)
})
