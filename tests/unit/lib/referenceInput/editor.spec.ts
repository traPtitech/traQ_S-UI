import { redo, undo } from '@tiptap/pm/history'
import { NodeSelection } from '@tiptap/pm/state'

import { contentToParts, partsToContent } from '/@/lib/referenceInput/editor'
import { encodeReference, parseInput, serializeInput } from '/@/lib/references'

import { createInputEditor, pressKey, readSource as source } from './fixture'

const embedded = encodeReference({
  type: 'user',
  id: 'id-before-rename',
  raw: '@alice'
})

const createEditor = (source: string) =>
  createInputEditor(source, { label: reference => '@renamed-' + reference.id })
const press = pressKey

describe('plain Markdown editor with atomic references', () => {
  it('does not reopen references while the composition DOM is settling', () => {
    const editor = createInputEditor(embedded, { isComposing: () => true })
    editor.commands.setTextSelection(2)

    const event = new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      isComposing: false,
      bubbles: true,
      cancelable: true
    })

    editor.view.dom.dispatchEvent(event)
    expect(source(editor)).toBe(embedded)
    expect(event.defaultPrevented).toBe(false)
  })

  it.each(['', `${embedded} `])(
    'applies IME deletions without reopening references after %j',
    async prefix => {
      const editor = createEditor(`${prefix}あああああ`)
      const dom = editor.view.dom
      document.body.append(dom)
      editor.commands.setTextSelection(editor.state.doc.content.size - 1)
      editor.view.focus()

      editor.setOptions({
        editorProps: { handleScrollToSelection: () => true }
      })

      dom.dispatchEvent(
        new CompositionEvent('compositionstart', { bubbles: true })
      )

      try {
        for (const count of [4, 3, 0]) {
          const text = dom.querySelector('p')?.lastChild

          if (!(text instanceof Text))
            throw new Error('Missing composition text')

          text.data = `${prefix ? ' ' : ''}${'あ'.repeat(count)}`
          document.getSelection()?.collapse(text, text.length)

          await vi.waitFor(() => {
            expect(source(editor)).toBe(`${prefix}${'あ'.repeat(count)}`)
          })

          expect(editor.view.composing).toBe(true)
          expect(editor.state.selection.empty).toBe(true)
          expect(editor.state.selection.head).toBe(
            editor.state.doc.content.size - 1
          )

          if (prefix) {
            const reference = editor.state.doc.nodeAt(1)
            expect(reference?.type.name).toBe('reference')
            expect(reference?.attrs['reference'].id).toBe('id-before-rename')
          }
        }
      } finally {
        dom.dispatchEvent(
          new CompositionEvent('compositionend', { bubbles: true })
        )

        dom.remove()
      }
    }
  )

  it.each(['cursor', 'node selection'])(
    'reopens the current label with Backspace from a %s and preserves its ID through Undo/Redo',
    selection => {
      const editor = createEditor(`before ${embedded} after`)

      if (selection === 'cursor') editor.commands.setTextSelection(9)
      else editor.commands.setNodeSelection(8)

      press(editor, 'Backspace')
      const text = '@renamed-id-before-rename'

      expect(source(editor)).toBe(`before ${text} after`)
      expect(editor.state.selection.empty).toBe(true)
      expect(editor.state.selection.from).toBe(8 + text.length)
      expect(undo(editor.state, editor.view.dispatch)).toBe(true)
      expect(source(editor)).toBe(`before ${embedded} after`)
      expect(redo(editor.state, editor.view.dispatch)).toBe(true)
      expect(source(editor)).toBe(`before ${text} after`)
    }
  )

  it('undoes reopening separately from a just-completed reference', () => {
    const editor = createEditor('@alice')

    editor.commands.insertContentAt(
      { from: 1, to: 7 },
      partsToContent(parseInput(embedded, 'message')).content?.[0]?.content ??
        []
    )

    press(editor, 'Backspace')

    expect(source(editor)).toBe('@renamed-id-before-rename')

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(embedded)

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe('@alice')
  })

  it('deletes a selected text range containing a reference', () => {
    const editor = createEditor(`before ${embedded} after`)
    editor.commands.setTextSelection({ from: 1, to: 9 })
    press(editor, 'Backspace')

    expect(source(editor)).toBe(' after')

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(`before ${embedded} after`)
  })

  it('removes a reference in one Delete operation', () => {
    const editor = createEditor(embedded)
    editor.commands.setTextSelection(1)
    press(editor, 'Delete')

    expect(source(editor)).toBe('')

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(embedded)
  })

  it('round trips blank lines, tabs, trailing spaces and final newlines', () => {
    const text = `  **literal markdown**\n\n\t${embedded}  \n\n`

    expect(source(createEditor(text))).toBe(text.replace(embedded, '@alice'))
  })

  it('renders a current label without changing the persisted reference', () => {
    const editor = createEditor(embedded)

    expect(editor.view.dom.textContent).toContain('@renamed-id-before-rename')
    expect(source(editor)).toBe(embedded)
  })

  it('deletes one reference and restores the same ID with Undo/Redo', () => {
    const editor = createEditor(`before ${embedded} after`)

    editor.view.dispatch(
      editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, 8))
    )

    editor.commands.deleteSelection()

    expect(source(editor)).toBe('before  after')
    expect(undo(editor.state, editor.view.dispatch)).toBe(true)
    expect(source(editor)).toBe(`before ${embedded} after`)
    expect(redo(editor.state, editor.view.dispatch)).toBe(true)
    expect(source(editor)).toBe('before  after')
  })

  it('converts a reference surrounded by code to text in the same undo step', () => {
    const editor = createEditor(embedded)
    const tr = editor.state.tr.insertText('`', 2).insertText('`', 1)
    editor.view.dispatch(tr)

    expect(source(editor)).toBe('`@alice`')

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(embedded)

    redo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe('`@alice`')
  })

  it('preserves references in a copied partial selection', () => {
    const editor = createEditor(`first ${embedded} last`)
    editor.commands.setTextSelection({ from: 7, to: 8 })

    expect(
      serializeInput(contentToParts(editor.state.selection.content().content))
    ).toBe(embedded)
  })

  it('inserts ordinary text without interpreting Markdown', () => {
    const editor = createEditor('')
    const text = '# title\n\n- list\n**bold**  \n'
    editor.commands.insertContent([{ type: 'text', text }])

    expect(source(editor)).toBe(text)
  })
})
