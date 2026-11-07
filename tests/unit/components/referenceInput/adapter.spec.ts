import { nextTick, ref } from 'vue'

import { EditorContent } from '@tiptap/vue-3'
import { mount } from '@vue/test-utils'

import ReferenceInput from '/@/components/UI/ReferenceInput.vue'
import type { ReferenceSuggestions } from '/@/composables/referenceInput/useReferenceSuggestions'
import useTraqReferenceInput from '/@/composables/referenceInput/useTraqReferenceInput'
import { analyzeMarkdownSource } from '/@/lib/markdown/analysis'
import type { ReferenceInputAdapter } from '/@/lib/referenceInput/adapter'
import type { InputPart } from '/@/lib/references'

vi.mock('/@/composables/referenceInput/useTraqReferenceInput', () => ({
  default: vi.fn(() => {
    throw new Error('The traQ adapter must not be initialized')
  })
}))

const wrappers: ReturnType<typeof mount<typeof ReferenceInput>>[] = []
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()))
beforeAll(() => {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList
  Range.prototype.getBoundingClientRect = () => new DOMRect()
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

const makeAdapter = () => {
  const controller: ReferenceSuggestions = {
    shown: ref(true),
    candidates: ref([]),
    selectedIndex: ref(-1),
    shortcuts: ref([]),
    position: ref({ top: 0, left: 0 }),
    update: vi.fn(),
    updatePosition: vi.fn(),
    hide: vi.fn(),
    confirmCandidate: vi.fn(),
    continuePath: vi.fn(),
    appendEffect: vi.fn(),
    onKeyDown: vi.fn(() => false)
  }
  const reference: InputPart = {
    type: 'reference',
    reference: { type: 'user', id: 'host-id', raw: '@host' }
  }
  const adapter: ReferenceInputAdapter = {
    markdown: {
      analyze: vi.fn(analyzeMarkdownSource),
      render: vi.fn(() => '<b>host image</b>')
    },
    label: () => '@host label',
    references: {
      parse: vi.fn((source: string): InputPart[] =>
        source === '[host-id]' ? [reference] : [{ type: 'text', text: source }]
      ),
      serialize: vi.fn((parts: readonly InputPart[]) =>
        parts
          .map(part =>
            part.type === 'text' ? part.text : `[${part.reference.id}]`
          )
          .join('')
      ),
      normalize: vi.fn((parts: readonly InputPart[]) => [...parts])
    },
    clipboard: { read: vi.fn(() => undefined), write: vi.fn() },
    suggestions: vi.fn(() => controller)
  }
  return { adapter, controller }
}

const makeInput = async (source: string, adapter: ReferenceInputAdapter) => {
  const wrapper = mount(ReferenceInput, {
    attachTo: document.body,
    props: { modelValue: source, adapter, markdown: true },
    slots: { suggestions: '<div data-host-suggestions />' }
  })
  wrappers.push(wrapper)
  await nextTick()
  const editor = wrapper.getComponent(EditorContent).props('editor')
  if (!editor) throw new Error('ReferenceInput editor is not mounted')
  return { wrapper, editor }
}

it('uses host reference serialization, clipboard and suggestions without initializing traQ stores', async () => {
  const { adapter, controller } = makeAdapter()
  const { wrapper, editor } = await makeInput('[host-id]', adapter)
  expect(editor.view.dom.textContent).toBe('@host label')
  expect(wrapper.find('[data-host-suggestions]').exists()).toBe(true)
  expect(adapter.suggestions).toHaveBeenCalledOnce()
  expect(useTraqReferenceInput).not.toHaveBeenCalled()

  editor.commands.setTextSelection(2)
  editor.commands.insertContent('!')
  await nextTick()
  expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['[host-id]!'])
  expect(adapter.references.normalize).toHaveBeenCalled()
  editor.commands.selectAll()
  const data = { getData: vi.fn(() => ''), setData: vi.fn() }
  const copy = new Event('copy', { bubbles: true, cancelable: true })
  Object.defineProperty(copy, 'clipboardData', { value: data })
  editor.view.dom.dispatchEvent(copy)
  expect(adapter.clipboard.write).toHaveBeenCalledWith(
    data,
    expect.any(Array),
    'message'
  )
  const paste = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(paste, 'clipboardData', { value: data })
  editor.view.dom.dispatchEvent(paste)
  expect(adapter.clipboard.read).toHaveBeenCalledWith(data, 'message')
  editor.view.dom.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  )
  expect(controller.onKeyDown).toHaveBeenCalled()
})

it('keeps Markdown analysis and subtree rendering specific to each mounted editor', async () => {
  const first = makeAdapter().adapter
  const second = makeAdapter().adapter
  second.markdown.render = vi.fn(() => '<i>other image</i>')
  const a = await makeInput('![alt](https://example.com/x.png)', first)
  const b = await makeInput('![alt](https://example.com/x.png)', second)
  await vi.waitFor(() => {
    expect(a.wrapper.find('.markdown-input-rendered b').text()).toBe(
      'host image'
    )
    expect(b.wrapper.find('.markdown-input-rendered i').text()).toBe(
      'other image'
    )
  })
  expect(first.markdown.analyze).toHaveBeenCalled()
  expect(second.markdown.analyze).toHaveBeenCalled()
  expect(first.markdown.render).toHaveBeenCalled()
  expect(second.markdown.render).toHaveBeenCalled()
})
