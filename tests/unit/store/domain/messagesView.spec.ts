import type { Message } from '@traptitech/traq'
import type { EmbeddingOrUrl } from '@traptitech/traq-markdown-it'

import { flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'

import { useMessagesView } from '/@/store/domain/messagesView'

const mocks = vi.hoisted(() => ({
  messages: new Map<string, Message>(),
  fetchMessage: vi.fn(),
  fetchFileMetaData: vi.fn(),
  render: vi.fn()
}))

vi.mock('/@/store/entities/messages', () => ({
  useMessagesStore: () => ({
    messagesMap: { value: mocks.messages },
    fetchMessage: mocks.fetchMessage,
    fetchFileMetaData: mocks.fetchFileMetaData,
    fetchOgpData: vi.fn()
  })
}))

vi.mock('/@/lib/markdown/markdown', () => ({ render: mocks.render }))

const message = (id: string, content: string) => ({ id, content }) as Message

const rendered = (text: string, embeddings: EmbeddingOrUrl[] = []) => ({
  renderedText: `<p>${text}</p>`,
  embeddings
})

beforeEach(() => {
  vi.resetAllMocks()
  mocks.messages.clear()
  mocks.fetchMessage.mockImplementation(async ({ messageId }) => {
    const result = mocks.messages.get(messageId)

    if (!result) throw new Error(`Missing message ${messageId}`)

    return result
  })

  mocks.render.mockImplementation(async (text: string) => rendered(text))
})

it('renders current content when another reader updates the cache during rendering', async () => {
  const pending = Promise.withResolvers<ReturnType<typeof rendered>>()
  mocks.messages.set('message', message('message', 'old'))
  mocks.render.mockReturnValueOnce(pending.promise)
  const view = useMessagesView(createPinia())
  const rendering = view.renderMessageContent('message')
  await flushPromises()

  mocks.messages.set('message', message('message', 'new'))
  pending.resolve(rendered('old'))
  await rendering

  expect(view.renderedContentMap.value.get('message')).toBe('<p>new</p>')
})

it('renders current content after the old content finishes preparing its embeddings', async () => {
  const pending = Promise.withResolvers<void>()
  mocks.messages.set('message', message('message', 'old'))
  mocks.render.mockResolvedValueOnce(
    rendered('old', [{ type: 'file', id: 'file' }])
  )
  mocks.fetchFileMetaData.mockReturnValueOnce(pending.promise)
  const view = useMessagesView(createPinia())
  const rendering = view.renderMessageContent('message')
  await flushPromises()

  mocks.messages.set('message', message('message', 'new'))
  pending.resolve()
  await rendering

  expect(view.renderedContentMap.value.get('message')).toBe('<p>new</p>')
  expect(view.embeddingsMap.value.get('message')).toEqual([])
})

it('renders current quoted content without requiring a separate update event', async () => {
  const pending = Promise.withResolvers<ReturnType<typeof rendered>>()
  mocks.messages.set('parent', message('parent', 'parent'))
  mocks.messages.set('quote', message('quote', 'old quote'))
  mocks.render.mockImplementation(async (text: string) => {
    if (text === 'parent')
      return rendered(text, [{ type: 'message', id: 'quote' }])
    return text === 'old quote' ? pending.promise : rendered(text)
  })
  const view = useMessagesView(createPinia())
  const rendering = view.renderMessageContent('parent')
  await flushPromises()

  mocks.messages.set('quote', message('quote', 'new quote'))
  pending.resolve(rendered('old quote'))
  await rendering

  expect(view.renderedContentMap.value.get('quote')).toBe('<p>new quote</p>')
  expect(view.renderedContentMap.value.get('parent')).toBe('<p>parent</p>')
})

it('does not publish a newer body if the request is invalidated while retrying rendering', async () => {
  const old = Promise.withResolvers<ReturnType<typeof rendered>>()
  const current = Promise.withResolvers<ReturnType<typeof rendered>>()
  mocks.messages.set('message', message('message', 'old'))
  mocks.render
    .mockReturnValueOnce(old.promise)
    .mockReturnValueOnce(current.promise)
  let isCurrent = true
  const view = useMessagesView(createPinia())
  const rendering = view.renderMessageContent('message', () => isCurrent)
  await flushPromises()

  mocks.messages.set('message', message('message', 'new'))
  old.resolve(rendered('old'))
  await flushPromises()
  isCurrent = false
  current.resolve(rendered('new'))
  await rendering

  expect(view.renderedContentMap.value.size).toBe(0)
  expect(view.embeddingsMap.value.size).toBe(0)
})

it.each([false, true])(
  'preserves a newer render when an old render finishes after reset=%s',
  async reset => {
    const pending = Promise.withResolvers<ReturnType<typeof rendered>>()
    mocks.messages.set('message', message('message', 'old'))
    mocks.render.mockReturnValueOnce(pending.promise)
    const view = useMessagesView(createPinia())

    const old = view.renderMessageContent('message')
    await flushPromises()

    if (reset) view.resetRenderedContent()

    mocks.messages.set('message', message('message', 'new'))
    await view.renderMessageContent('message')
    pending.resolve(rendered('old', [{ type: 'message', id: 'old-quote' }]))
    await old

    expect(view.renderedContentMap.value.get('message')).toBe('<p>new</p>')
    expect(view.embeddingsMap.value.get('message')).toEqual([])
  }
)

it('does not restore rendered content after the cache has been reset', async () => {
  const pending = Promise.withResolvers<ReturnType<typeof rendered>>()
  mocks.messages.set('message', message('message', 'old'))
  mocks.render.mockReturnValueOnce(pending.promise)
  const view = useMessagesView(createPinia())
  const old = view.renderMessageContent('message')
  await flushPromises()

  view.resetRenderedContent()
  pending.resolve(rendered('old'))
  await old

  expect(view.renderedContentMap.value.size).toBe(0)
  expect(view.embeddingsMap.value.size).toBe(0)
})

it('does not overwrite a quoted message that was updated during rendering', async () => {
  const pending = Promise.withResolvers<ReturnType<typeof rendered>>()
  mocks.messages.set('parent', message('parent', 'parent'))
  mocks.messages.set('quote', message('quote', 'old quote'))

  mocks.render.mockImplementation(async (text: string) => {
    if (text === 'parent') {
      return rendered(text, [{ type: 'message', id: 'quote' }])
    }

    return text === 'old quote' ? pending.promise : rendered(text)
  })

  const view = useMessagesView(createPinia())
  const old = view.renderMessageContent('parent')
  await flushPromises()
  mocks.messages.set('quote', message('quote', 'new quote'))
  await view.renderMessageContent('quote')
  pending.resolve(rendered('old quote'))
  await old

  expect(view.renderedContentMap.value.get('quote')).toBe('<p>new quote</p>')
  expect(view.renderedContentMap.value.get('parent')).toBe('<p>parent</p>')
})

it.each(['parent', 'quote'])(
  'does not cache an invalidated request that is rendering the %s',
  async pendingMessageId => {
    const pending = Promise.withResolvers<ReturnType<typeof rendered>>()
    mocks.messages.set('parent', message('parent', 'parent'))
    mocks.messages.set('quote', message('quote', 'quote'))

    mocks.render.mockImplementation(async (text: string) => {
      if (text === pendingMessageId) return pending.promise

      return rendered(text, [{ type: 'message', id: 'quote' }])
    })

    let isCurrent = true
    const view = useMessagesView(createPinia())
    const request = view.renderMessageContent('parent', () => isCurrent)
    await flushPromises()
    isCurrent = false
    pending.resolve(rendered(pendingMessageId))
    await request

    expect(view.renderedContentMap.value.size).toBe(0)
    expect(view.embeddingsMap.value.size).toBe(0)
  }
)
