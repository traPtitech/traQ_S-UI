import { nextTick } from 'vue'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'

import {
  embedded,
  focus,
  getEditor,
  installReferenceInputFixture,
  lastValue,
  makeInput,
  press
} from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

installReferenceInputFixture()

it('restores suggestions after importing the confirmed composition text', async () => {
  const wrapper = await makeInput({ source: '@alice' })
  await focus(wrapper)

  const editor = getEditor(wrapper)
  if (!editor) throw new Error('Expected editor')

  editor.commands.setTextSelection(7)
  const element = editor.view.dom

  element.dispatchEvent(
    new CompositionEvent('compositionstart', { bubbles: true })
  )

  const text = element.querySelector('p')?.firstChild
  if (!(text instanceof Text)) throw new Error('Expected composition text')

  text.data = '@al'
  document.getSelection()?.collapse(text, text.length)

  await vi.waitFor(() => expect(lastValue(wrapper)).toBe('@al'))
  expect(wrapper.findComponent(DropdownSuggester).props('isShown')).toBe(false)

  element.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true })
  )

  await vi.waitFor(() => {
    expect(lastValue(wrapper)).toBe('@al')
    expect(wrapper.findComponent(DropdownSuggester).props('isShown')).toBe(true)
  })
})

it.each([
  {
    description: 'the standard composition flag',
    key: 'Enter',
    options: { isComposing: true }
  },

  {
    description: 'the Process key',
    key: 'Process',
    options: { isComposing: false }
  },

  {
    description: 'the legacy IME boundary signal',
    key: 'Enter',
    options: { isComposing: false, keyCode: 229 }
  }
])(
  'ignores $description before compositionstart without selecting a suggestion',
  async ({ key, options }) => {
    const wrapper = await makeInput()
    await focus(wrapper)
    wrapper.vm.insertText('@al')
    await nextTick()

    expect(press(wrapper, key, options)).toBe(true)
    await nextTick()

    expect(lastValue(wrapper)).toBe('@al')
    expect(wrapper.emitted('keydown')).toBeUndefined()

    press(wrapper, 'Enter')
    await nextTick()

    expect(lastValue(wrapper)).toBe(`${embedded} `)
  }
)
