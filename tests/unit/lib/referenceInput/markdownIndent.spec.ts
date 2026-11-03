import { undo } from '@tiptap/pm/history'

import { markdownIndent } from '/@/lib/referenceInput/markdownIndent'
import { encodeReference } from '/@/lib/references'

import { createInputEditor, readSource as source } from './fixture'

const create = createInputEditor

describe('Markdown Tab editing', () => {
  it.each([
    ['abc¦def', 'abc  ¦def', false],
    ['> text¦', '> text  ¦', false],
    ['- item¦', '- item  ¦', false],
    ['   ¦text', ' ¦text', true],
    ['\t¦text', '¦text', true],
    ['plain¦', 'plain¦', true],
    ['¦', '  ¦', false]
  ])('inserts or removes indentation at %s', (before, after, outdent) => {
    const editor = create(before.replace('¦', ''))
    editor.commands.setTextSelection(before.indexOf('¦') + 1)

    const transaction = markdownIndent(
      editor.state,
      outdent ? 'outdent' : 'indent'
    )

    const changed = transaction.docChanged
    editor.view.dispatch(transaction)

    expect(source(editor)).toBe(after.replace('¦', ''))
    expect(editor.state.selection.head).toBe(after.indexOf('¦') + 1)

    if (changed) {
      undo(editor.state, editor.view.dispatch)
      expect(source(editor)).toBe(before.replace('¦', ''))
    }
  })

  it.each([false, true])(
    'indents selected lines and preserves selection direction: %s',
    reverse => {
      const editor = create('a\nb\nc')

      editor.commands.setTextSelection(
        reverse ? { from: 5, to: 1 } : { from: 1, to: 5 }
      )

      const selection = editor.state.selection.toJSON()
      editor.view.dispatch(markdownIndent(editor.state))

      expect(source(editor)).toBe('  a\n  b\nc')
      expect(editor.state.selection.anchor > editor.state.selection.head).toBe(
        reverse
      )

      editor.view.dispatch(markdownIndent(editor.state, 'outdent'))

      expect(source(editor)).toBe('a\nb\nc')
      expect(editor.state.selection.toJSON()).toEqual(selection)
    }
  )

  it('preserves reference IDs while indenting selected lines', () => {
    const reference = encodeReference({
      type: 'user',
      id: 'user-id',
      raw: '@alice'
    })

    const editor = create(reference + '\ntext')
    editor.commands.selectAll()
    editor.view.dispatch(markdownIndent(editor.state))

    expect(source(editor)).toBe('  ' + reference + '\n  text')

    undo(editor.state, editor.view.dispatch)

    expect(source(editor)).toBe(reference + '\ntext')
  })
})
