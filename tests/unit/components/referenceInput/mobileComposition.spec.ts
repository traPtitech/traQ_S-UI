import { nextTick } from 'vue'

import { EditorContent } from '@tiptap/vue-3'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'

import {
  embedded,
  focus,
  installReferenceInputFixture,
  lastValue,
  makeInput,
  setChannelTree
} from './fixture'

await vi.hoisted(async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36'
  )
  await import('./mocks')
})

installReferenceInputFixture()

const prefix = 'before '

const compose = async (
  wrapper: Awaited<ReturnType<typeof makeInput>>,
  value: string
) => {
  const editor = wrapper.getComponent(EditorContent).props('editor')
  if (!editor) throw new Error('Editor is not mounted')
  editor.commands.setTextSelection(prefix.length + 1)
  const element = editor.view.dom
  element.dispatchEvent(
    new CompositionEvent('compositionstart', { bubbles: true })
  )
  const text = element.querySelector('p')?.firstChild
  if (!(text instanceof Text)) throw new Error('Missing composition text')
  text.data = prefix + value
  document.getSelection()?.collapse(text, text.length)
  element.dispatchEvent(
    new CompositionEvent('compositionupdate', { bubbles: true, data: value })
  )
  await vi.waitFor(() => expect(lastValue(wrapper)).toBe(prefix + value))

  return editor
}

it.each([':te', '@al', '#ti', ':@al', ':test.la'])(
  'shows mobile ASCII candidates during composition for %s',
  async value => {
    setChannelTree()
    const wrapper = await makeInput({ source: prefix })
    await focus(wrapper)
    const editor = await compose(wrapper, value)

    expect(editor.view.composing).toBe(true)
    expect(wrapper.getComponent(DropdownSuggester).props('isShown')).toBe(true)
    editor.view.dom.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true })
    )
  }
)

it('waits for compositionend before replacing a tapped candidate', async () => {
  const wrapper = await makeInput({ source: prefix })
  await focus(wrapper)
  const editor = await compose(wrapper, '@al')
  const menu = wrapper.getComponent(DropdownSuggester)
  const word = menu.props('candidates')?.[0]?.word
  if (!word) throw new Error('Missing mention candidate')

  menu.vm.$emit('select', word)
  await nextTick()
  expect(lastValue(wrapper)).toBe(prefix + '@al')
  expect(editor.view.composing).toBe(true)

  editor.view.dom.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true })
  )
  await vi.waitFor(() => {
    expect(lastValue(wrapper)).toBe(prefix + embedded + ' ')
    expect(editor.isFocused).toBe(true)
  })
})

it('discards a deferred candidate when composition changes before confirmation', async () => {
  const wrapper = await makeInput({ source: prefix })
  await focus(wrapper)
  const editor = await compose(wrapper, '@al')
  const menu = wrapper.getComponent(DropdownSuggester)
  const word = menu.props('candidates')?.[0]?.word
  if (!word) throw new Error('Missing mention candidate')
  menu.vm.$emit('select', word)

  const text = editor.view.dom.querySelector('p')?.firstChild
  if (!(text instanceof Text)) throw new Error('Missing composition text')
  text.data = prefix + '@another'
  document.getSelection()?.collapse(text, text.length)
  await vi.waitFor(() => expect(lastValue(wrapper)).toBe(prefix + '@another'))
  vi.useFakeTimers()
  try {
    editor.view.dom.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true })
    )
    await vi.advanceTimersByTimeAsync(1)

    expect(lastValue(wrapper)).toBe(prefix + '@another')
    expect(editor.isFocused).toBe(false)
  } finally {
    vi.useRealTimers()
  }
})
