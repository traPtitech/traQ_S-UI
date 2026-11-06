import { nextTick } from 'vue'

import {
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

describe('Markdown line break input paths', () => {
  it.each([
    ['Backspace', '- item\n  '],
    ['Tab', '- item\n  - ']
  ])(
    'changes only a newly completed empty marker with %s',
    async (key, after) => {
      const wrapper = await makeInput({ source: '- item' })
      await wrapper.setProps({ markdown: true })
      await focus(wrapper)
      const editor = getEditor(wrapper)
      editor.commands.setTextSelection(editor.state.doc.content.size - 1)
      press(wrapper, 'Enter')
      await nextTick()

      expect(lastValue(wrapper)).toBe('- item\n- ')
      press(wrapper, key)
      await nextTick()

      expect(lastValue(wrapper)).toBe(after)
    }
  )

  it('uses Shift+Enter to continue the same list item', async () => {
    const wrapper = await makeInput({ source: '- item' })
    await wrapper.setProps({ markdown: true })
    await focus(wrapper)
    const editor = getEditor(wrapper)
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    press(wrapper, 'Enter', { shiftKey: true })
    await nextTick()

    expect(lastValue(wrapper)).toBe('- item\n  ')
  })

  it('continues the same item for a software keyboard soft line break', async () => {
    const wrapper = await makeInput({ source: '- item' })
    await wrapper.setProps({ markdown: true })
    await focus(wrapper)
    const editor = getEditor(wrapper)
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)

    wrapper.vm.element?.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'insertLineBreak',
        bubbles: true,
        cancelable: true
      })
    )

    await nextTick()

    expect(lastValue(wrapper)).toBe('- item\n  ')
  })

  it.each([
    ['> quote', '> quote\n> '],
    ['> quote\n> ', '> quote\n\n'],
    ['- item', '- item\n- '],
    ['- item\n  ', '- item\n\n'],
    ['12. item', '12. item\n13. '],
    ['> - item', '> - item\n> - ']
  ])(
    'uses the same continuation for keydown and beforeinput after %s',
    async (before, after) => {
      for (const viaKeyboard of [true, false]) {
        const wrapper = await makeInput({ source: before })
        await wrapper.setProps({ markdown: true })
        await focus(wrapper)
        const editor = getEditor(wrapper)
        editor.commands.setTextSelection(editor.state.doc.content.size - 1)

        if (viaKeyboard) {
          press(wrapper, 'Enter')
        } else {
          wrapper.vm.element?.dispatchEvent(
            new InputEvent('beforeinput', {
              inputType: 'insertParagraph',
              bubbles: true,
              cancelable: true
            })
          )
        }

        await nextTick()

        expect(lastValue(wrapper)).toBe(after)
      }
    }
  )

  it('inserts a plain newline with Markdown disabled', async () => {
    const wrapper = await makeInput({ source: '> quote' })
    await focus(wrapper)
    const editor = getEditor(wrapper)
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    press(wrapper, 'Enter')
    await nextTick()

    expect(lastValue(wrapper)).toBe('> quote\n')
  })

  it('allows the parent to handle submission before any Markdown line break', async () => {
    const wrapper = await makeInput({ source: '> quote' })

    await wrapper.setProps({
      markdown: true,
      onKeydown: (event: KeyboardEvent) => event.preventDefault()
    })

    await focus(wrapper)
    press(wrapper, 'Enter')
    await nextTick()

    expect(lastValue(wrapper)).toBeUndefined()
  })
})

it('toggles inline Markdown without changing the draft or its selection', async () => {
  const wrapper = await makeInput({ source: '**hello** and _world_' })
  await focus(wrapper)
  const content = getEditor(wrapper)
  content?.commands.setTextSelection(5)
  await wrapper.setProps({ markdown: true })

  expect(wrapper.find('.markdown-input-strong').text()).toBe('hello')
  expect(wrapper.find('.markdown-input-emphasis').text()).toBe('world')

  expect(
    wrapper.findAll('.markdown-input-syntax').map(node => node.text())
  ).toEqual(['**', '**', '_', '_'])

  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  expect(content?.state.selection.from).toBe(5)

  await wrapper.setProps({ markdown: false })

  expect(wrapper.find('.markdown-input-strong').exists()).toBe(false)
  expect(content?.state.selection.from).toBe(5)
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})

it('updates inline rendering when another draft is loaded', async () => {
  const wrapper = await makeInput({ source: '**first**' })
  await wrapper.setProps({ markdown: true })
  await wrapper.setProps({ modelValue: '_next_' })

  expect(wrapper.find('.markdown-input-strong').exists()).toBe(false)
  expect(wrapper.find('.markdown-input-emphasis').text()).toBe('next')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})
