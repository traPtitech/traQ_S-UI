import { ref } from 'vue'

import type * as ApiModule from '/@/lib/apis'
import usePostMessage from '/@/composables/messageComposer/usePostMessage'
import apis from '/@/lib/apis'
import { encodeReference } from '/@/lib/references'
import type { Attachment } from '/@/store/ui/messageInputStateStore'

const mocks = vi.hoisted(() => ({
  state: { text: 'first draft', attachments: [] as Attachment[] },
  post: vi.fn(),
  upload: vi.fn(),
  clear: vi.fn(),
  error: vi.fn()
}))

vi.mock('/@/lib/apis', async importOriginal => ({
  ...(await importOriginal<typeof ApiModule>()),
  embeddingOrigin: 'https://example.test'
}))

vi.mock('/@/store/ui/messageInputStateStore', () => ({
  useMessageInputStateStore: () => ({
    captureDraftSnapshot: () => ({
      state: { ...mocks.state, attachments: [...mocks.state.attachments] },
      isEmpty: false
    }),
    consumeSnapshot: mocks.clear
  })
}))
vi.mock('/@/composables/useChannelPath', () => ({
  default: () => ({
    channelIdToShortPathString: () => '#test',
    channelPathStringToId: (path: string) => {
      if (path === 'general') return 'channel-id'
      throw new Error('unknown channel')
    }
  })
}))
vi.mock('/@/store/entities/channels', async () => {
  const { ref } = await import('vue')
  return { useChannelsStore: () => ({ channelsMap: ref(new Map()) }) }
})
vi.mock('/@/store/ui/toast', () => ({
  useToastStore: () => ({ addErrorToast: mocks.error })
}))

beforeEach(() => {
  vi.spyOn(apis, 'postMessage').mockImplementation(mocks.post)
  vi.spyOn(apis, 'postFile').mockImplementation(mocks.upload)

  for (const mock of [mocks.post, mocks.upload, mocks.clear, mocks.error])
    mock.mockReset()

  mocks.state = { text: 'first draft', attachments: [] }
  mocks.post.mockResolvedValue({})
  mocks.upload.mockResolvedValue({ data: { id: 'uploaded-file' } })
})

it('locks before posting and keeps the original channel and draft', async () => {
  const response = Promise.withResolvers<object>()
  mocks.post.mockReturnValueOnce(response.promise)
  const channel = ref('first-channel')
  const posting = usePostMessage(channel)
  const pending = posting.postMessage()
  expect(posting.isPosting.value).toBe(true)
  channel.value = 'second-channel'
  mocks.state.text = 'second draft'
  expect(await posting.postMessage()).toBe(false)
  response.resolve({})
  expect(await pending).toBe(true)
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith('first-channel', {
    content: 'first draft'
  })
  expect(posting.isPosting.value).toBe(false)
})

it('unlocks when posting fails and allows a retry', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  mocks.post.mockRejectedValueOnce(new Error('offline'))
  const posting = usePostMessage('channel')
  expect(await posting.postMessage()).toBe(false)
  expect(posting.isPosting.value).toBe(false)
  expect(mocks.clear).not.toHaveBeenCalled()
  expect(await posting.postMessage()).toBe(true)
})

it('posts plain names as text while preserving explicitly selected references', async () => {
  const selected = [
    { type: 'user', raw: '@alice', id: 'selected-user' },
    { type: 'group', raw: '@team', id: 'selected-group' },
    { type: 'channel', raw: '#general', id: 'selected-channel' }
  ] as const
  const literal =
    '`@alice` $@team$ https://example.test/#general [#general](https://example.test) :@alice: #missing'
  const text = `@Alice @team #general ${selected.map(encodeReference).join(' ')}\n${literal}`
  mocks.state.text = text

  expect(await usePostMessage('channel').postMessage()).toBe(true)
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith('channel', {
    content: text
  })
})

it.each(['@alice', '＠Alice', '@team', '#general', '＃general'])(
  'does not turn plain %s into a reference when posting',
  async text => {
    mocks.state.text = text
    expect(await usePostMessage('channel').postMessage()).toBe(true)
    expect(mocks.post).toHaveBeenCalledExactlyOnceWith('channel', {
      content: text
    })
  }
)

it('does not restore references made literal by Markdown', async () => {
  const selected = encodeReference({
    type: 'user',
    raw: '@alice',
    id: 'selected-id'
  })
  mocks.state.text = '`' + selected + '`\n' + selected
  expect(await usePostMessage('channel').postMessage()).toBe(true)
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith('channel', {
    content: '`@alice`\n' + selected
  })
})

it('unlocks after an upload failure without posting or clearing the draft', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  mocks.state.attachments = [
    { file: new File(['data'], 'file.txt'), type: 'file' }
  ]

  mocks.upload.mockRejectedValueOnce(new Error('offline'))
  const posting = usePostMessage('channel')
  expect(await posting.postMessage()).toBe(false)
  expect(posting.isPosting.value).toBe(false)
  expect(posting.progress.value).toBe(0)
  expect(mocks.post).not.toHaveBeenCalled()
  expect(mocks.clear).not.toHaveBeenCalled()
})
