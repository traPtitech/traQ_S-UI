import type { MarkdownRenderResult } from '@traptitech/traq-markdown-it'

import { effectScope, nextTick, ref } from 'vue'

import { flushPromises } from '@vue/test-utils'

import { useRenderedMarkdown } from '/@/composables/markdown/useRenderedMarkdown'

const renderer = vi.hoisted(() => ({ render: vi.fn(), renderInline: vi.fn() }))
vi.mock('/@/lib/markdown/markdown', () => renderer)

const result = (text: string): MarkdownRenderResult => ({
  rawText: text,
  renderedText: text,
  embeddings: []
})

beforeEach(() => {
  renderer.render.mockReset()
  renderer.renderInline.mockReset()
})

it('publishes only the latest render and notification', async () => {
  const first = Promise.withResolvers<MarkdownRenderResult>()
  const second = Promise.withResolvers<MarkdownRenderResult>()
  renderer.render
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)
  const source = ref('first')
  const notify = vi.fn()
  const scope = effectScope()

  try {
    const rendering = scope.run(() =>
      useRenderedMarkdown(source, { onRendered: notify })
    )
    if (!rendering) throw new Error('Effect scope is inactive')
    source.value = 'second'
    await nextTick()
    second.resolve(result('second'))
    await flushPromises()
    first.resolve(result('first'))
    await flushPromises()

    expect(rendering.renderedContent.value).toBe('second')
    expect(notify).toHaveBeenCalledOnce()
  } finally {
    scope.stop()
  }
})

it('does not notify a stale render after its layout dependencies settle', async () => {
  renderer.render.mockImplementation(async (text: string) => result(text))
  const layout = Promise.withResolvers<void>()
  const prepareLayout = vi.fn().mockReturnValueOnce(layout.promise)
  const notify = vi.fn()
  const source = ref('first')
  const scope = effectScope()

  try {
    scope.run(() =>
      useRenderedMarkdown(source, { prepareLayout, onRendered: notify })
    )
    await flushPromises()
    source.value = 'second'
    await flushPromises()
    layout.resolve()
    await flushPromises()

    expect(notify).toHaveBeenCalledOnce()
  } finally {
    scope.stop()
  }
})

it('does not publish a render after disposal', async () => {
  const pending = Promise.withResolvers<MarkdownRenderResult>()
  renderer.render.mockReturnValueOnce(pending.promise)
  const scope = effectScope()
  const notify = vi.fn()
  const rendering = scope.run(() =>
    useRenderedMarkdown('source', { onRendered: notify })
  )
  if (!rendering) throw new Error('Effect scope is inactive')
  scope.stop()
  pending.resolve(result('late'))
  await flushPromises()

  expect(rendering.rendered.value).toBeUndefined()
  expect(notify).not.toHaveBeenCalled()
})

it('exposes a rendering failure and recovers when the render mode changes', async () => {
  const failure = new Error('render failed')
  renderer.render.mockRejectedValueOnce(failure)
  renderer.renderInline.mockResolvedValueOnce(result('inline'))
  const inline = ref(false)
  const scope = effectScope()

  try {
    const rendering = scope.run(() => useRenderedMarkdown('source', { inline }))
    if (!rendering) throw new Error('Effect scope is inactive')
    await flushPromises()
    expect(rendering.error.value).toBe(failure)

    inline.value = true
    await flushPromises()

    expect(rendering.error.value).toBeUndefined()
    expect(rendering.renderedContent.value).toBe('inline')
  } finally {
    scope.stop()
  }
})
