import { nextTick } from 'vue'

import { EditorContent } from '@tiptap/vue-3'

import { embedded, focus, lastValue, makeInput, press } from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

describe('reference input padding focus', () => {
  it.each(['message', 'search'] as const)(
    'focuses the %s input when its padding is pressed',
    async mode => {
      const wrapper = await makeInput('hello', mode)

      const event = new MouseEvent('mousedown', {
        button: 0,
        bubbles: true,
        cancelable: true
      })

      wrapper.element.dispatchEvent(event)

      await vi.waitFor(() => {
        expect(document.activeElement).toBe(wrapper.vm.element)
      })

      expect(event.defaultPrevented).toBe(true)
      expect(wrapper.emitted('focus')).toHaveLength(1)
      expect(lastValue(wrapper)).toBeUndefined()
    }
  )

  it('restores focus from padding without changing the selection', async () => {
    const wrapper = await makeInput('hello')
    await focus(wrapper)
    const editor = wrapper.getComponent(EditorContent).props('editor')

    if (!editor) throw new Error('Editor is not mounted')

    editor.commands.setTextSelection({ from: 2, to: 4 })
    const selection = editor.state.selection.toJSON()
    wrapper.vm.element?.blur()
    await wrapper.trigger('mousedown', { button: 0 })

    await vi.waitFor(() => {
      expect(document.activeElement).toBe(wrapper.vm.element)
    })

    expect(editor.state.selection.toJSON()).toEqual(selection)
    expect(lastValue(wrapper)).toBeUndefined()
  })

  it('does not intercept pointer events from child components', async () => {
    const wrapper = await makeInput('hello')

    const event = new MouseEvent('mousedown', {
      button: 0,
      bubbles: true,
      cancelable: true
    })

    wrapper.getComponent(EditorContent).element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(lastValue(wrapper)).toBeUndefined()
  })

  it.each([1, 2])(
    'leaves mouse button %s unchanged on padding',
    async button => {
      const wrapper = await makeInput('hello')

      const event = new MouseEvent('mousedown', {
        button,
        bubbles: true,
        cancelable: true
      })

      wrapper.element.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(false)
      expect(wrapper.emitted('focus')).toBeUndefined()
    }
  )
})

describe('reference input empty state', () => {
  it.each(['message', 'search'] as const)(
    'tracks document content when loading or clearing a %s input',
    async mode => {
      const wrapper = await makeInput('', mode)

      expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('true')

      for (const text of ['text', 'text\n', '\n', ' ', embedded]) {
        await wrapper.setProps({ modelValue: text })

        expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('false')

        await wrapper.setProps({ modelValue: '' })

        expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('true')
      }
    }
  )

  it.each([false, true])(
    'keeps a trailing newline nonempty while typing and clearing with Markdown %s',
    async markdown => {
      const wrapper = await makeInput('text')
      await wrapper.setProps({ markdown })
      await focus(wrapper)
      const editor = wrapper.getComponent(EditorContent).props('editor')

      if (!editor) throw new Error('Editor is not mounted')

      editor.commands.setTextSelection(editor.state.doc.content.size - 1)
      press(wrapper, 'Enter')
      await nextTick()

      expect(lastValue(wrapper)).toBe('text\n')
      expect(
        wrapper.vm.element?.querySelector('.ProseMirror-trailingBreak')
      ).not.toBeNull()
      expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('false')

      editor.commands.setTextSelection({
        from: 1,
        to: editor.state.doc.content.size - 1
      })

      editor.commands.deleteSelection()
      await nextTick()

      expect(lastValue(wrapper)).toBe('')
      expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('true')
    }
  )

  it('updates the empty state through Undo and Redo', async () => {
    const wrapper = await makeInput('text\n')
    await focus(wrapper)
    const editor = wrapper.getComponent(EditorContent).props('editor')

    if (!editor) throw new Error('Editor is not mounted')

    editor.commands.setTextSelection({
      from: 1,
      to: editor.state.doc.content.size - 1
    })

    editor.commands.deleteSelection()
    await nextTick()

    expect(lastValue(wrapper)).toBe('')
    expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('true')
    press(wrapper, 'z', { ctrlKey: true })
    await nextTick()

    expect(lastValue(wrapper)).toBe('text\n')
    expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('false')
    press(wrapper, 'y', { ctrlKey: true })
    await nextTick()

    expect(lastValue(wrapper)).toBe('')
    expect(wrapper.vm.element?.getAttribute('data-is-empty')).toBe('true')
  })

  it.each([false, true])(
    'updates the empty state as IME text is inserted and removed with Markdown %s',
    async markdown => {
      const wrapper = await makeInput()
      await wrapper.setProps({ markdown })
      await focus(wrapper)
      const editor = wrapper.getComponent(EditorContent).props('editor')

      if (!editor) throw new Error('Editor is not mounted')

      const element = editor.view.dom

      element.dispatchEvent(
        new CompositionEvent('compositionstart', { bubbles: true })
      )

      try {
        const paragraph = element.querySelector('p')

        if (!paragraph) throw new Error('Missing paragraph')

        const text = document.createTextNode('日本語')
        paragraph.insertBefore(text, paragraph.firstChild)
        document.getSelection()?.collapse(text, text.length)

        await vi.waitFor(() => {
          expect(lastValue(wrapper)).toBe('日本語')
          expect(element.getAttribute('data-is-empty')).toBe('false')
        })

        const current = paragraph.firstChild

        if (!(current instanceof Text))
          throw new Error('Missing composition text')

        current.data = ''
        document.getSelection()?.collapse(current, 0)

        await vi.waitFor(() => {
          expect(lastValue(wrapper)).toBe('')
          expect(element.getAttribute('data-is-empty')).toBe('true')
        })
      } finally {
        element.dispatchEvent(
          new CompositionEvent('compositionend', { bubbles: true })
        )
      }
    }
  )
})

it('clears Undo history when loading a different draft', async () => {
  const wrapper = await makeInput('first')
  wrapper.vm.insertText(' edit')
  await nextTick()
  await wrapper.setProps({ modelValue: 'second' })
  await focus(wrapper)
  press(wrapper, 'z', { ctrlKey: true })

  expect(wrapper.vm.element?.textContent).toBe('second')
})

it.each(['sent message', `${embedded} sent message`])(
  'clears the submitted draft when posting finishes: %s',
  async message => {
    const wrapper = await makeInput(message)
    await wrapper.setProps({ readonly: true })
    await wrapper.setProps({ readonly: false, modelValue: '' })

    expect(wrapper.vm.element?.textContent).toBe('')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await focus(wrapper)
    press(wrapper, 'z', { ctrlKey: true })

    expect(wrapper.vm.element?.textContent).toBe('')

    wrapper.vm.insertText('next message')

    expect(lastValue(wrapper)).toBe('next message')
  }
)

it('retains the draft when posting finishes without clearing it', async () => {
  const wrapper = await makeInput(`${embedded} unsent message`)
  await wrapper.setProps({ readonly: true })
  await wrapper.setProps({ readonly: false })

  expect(wrapper.vm.element?.textContent).toBe('@alice unsent message')
  expect(wrapper.emitted('update:modelValue')).toBeUndefined()
})

it('preserves Undo for an external edit and resets it for a new document key', async () => {
  const wrapper = await makeInput(embedded)
  await wrapper.setProps({ documentKey: 'first' })
  const editor = wrapper.getComponent(EditorContent).props('editor')
  if (!editor) throw new Error('Editor is not mounted')

  editor.commands.setTextSelection(2)
  wrapper.vm.insertText(' draft')
  await nextTick()
  await wrapper.setProps({
    modelValue: `${embedded} draft\nhttps://example.com/file`
  })
  await focus(wrapper)
  press(wrapper, 'z', { ctrlKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe(`${embedded} draft`)
  press(wrapper, 'z', { ctrlKey: true })
  await nextTick()
  expect(lastValue(wrapper)).toBe(embedded)

  wrapper.vm.insertText('changed')
  await nextTick()
  await wrapper.setProps({ modelValue: embedded, documentKey: 'second' })
  press(wrapper, 'z', { ctrlKey: true })
  await nextTick()
  expect(wrapper.vm.element?.textContent).toBe('@alice')
})

it('updates all accessible attributes through reactive props', async () => {
  const wrapper = await makeInput('', 'search')
  await wrapper.setProps({
    placeholder: 'updated',
    labelledBy: 'search-label',
    testId: 'search-field'
  })
  const element = wrapper.vm.element
  expect(element?.getAttribute('data-placeholder')).toBe('updated')
  expect(element?.getAttribute('aria-labelledby')).toBe('search-label')
  expect(element?.hasAttribute('aria-label')).toBe(false)
  expect(element?.getAttribute('data-testid')).toBe('search-field')

  await wrapper.setProps({ labelledBy: undefined, placeholder: 'another' })
  expect(element?.getAttribute('aria-label')).toBe('another')
  expect(element?.hasAttribute('aria-labelledby')).toBe(false)
})
