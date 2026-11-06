import { closeHistory } from '@tiptap/pm/history'
import { type EditorState, TextSelection } from '@tiptap/pm/state'

import { toDocumentPosition, toEditorOffset } from './editorCoordinates'
import { editorTextBetween } from './editorText'

/** 通常の Tab は空白を挿入し、範囲選択中は各行のインデントをまとめて変更する。 */
export const markdownIndent = (
  state: EditorState,
  direction: 'indent' | 'outdent' = 'indent'
) => {
  const outdent = direction === 'outdent'
  const transaction = closeHistory(state.tr)
  const { from, to, empty } = state.selection

  if (empty && !outdent) {
    transaction.insertText('  ', from, to)
    transaction.setSelection(TextSelection.create(transaction.doc, from + 2))

    return transaction.scrollIntoView()
  }

  const source = editorTextBetween(state.doc)

  const position = toEditorOffset(from)
  let start = position === 0 ? 0 : source.lastIndexOf('\n', position - 1) + 1
  const finish = empty ? toEditorOffset(to) : toEditorOffset(to) - 1

  while (start <= finish) {
    const point = transaction.mapping.map(toDocumentPosition(start))

    if (outdent) {
      const prefix = /^(?: {1,2}|\t)/.exec(source.slice(start))?.[0]

      if (prefix) transaction.delete(point, point + prefix.length)
    } else {
      transaction.insertText('  ', point)
    }

    const next = source.indexOf('\n', start)
    if (next === -1) break
    start = next + 1
  }

  transaction.setSelection(
    state.selection.map(transaction.doc, transaction.mapping)
  )

  return transaction.scrollIntoView()
}
