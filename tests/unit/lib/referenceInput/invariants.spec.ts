import { redo, undo } from '@tiptap/pm/history'

import { normalizeMessageSource } from '/@/lib/message/content'
import { contentToParts } from '/@/lib/referenceInput/editorDocument'
import {
  editorTextBetween,
  partsToEditorText
} from '/@/lib/referenceInput/editorText'
import { inputText, parseInput, serializeInput } from '/@/lib/references'

import { corpusReference, markdownCorpus } from '../../fixtures/markdownCorpus'
import { createInputEditor, readSource } from './fixture'

it.each(markdownCorpus.map((source, index) => ({ source, index })))(
  'preserves source, normalization and editor coordinates in corpus $index',
  ({ source }) => {
    const parts = parseInput(source, 'message')
    expect(serializeInput(parts)).toBe(source)
    inputText(parts, () => '@renamed')
    expect(serializeInput(parts)).toBe(source)

    const normalized = normalizeMessageSource(source)
    expect(normalizeMessageSource(normalized)).toBe(normalized)

    const editor = createInputEditor(normalized)
    const { doc } = editor.state
    expect(doc.childCount).toBe(1)
    expect(doc.firstChild?.type.name).toBe('paragraph')
    expect(editorTextBetween(doc)).toBe(partsToEditorText(contentToParts(doc)))
    expect(editorTextBetween(doc).length).toBe(doc.content.size - 2)
  }
)

it.each(['😀 ', '**bold** ', '> quote\n', 'line\r\n'])(
  'restores reference IDs and the selection through undo after %j',
  prefix => {
    const source = prefix + corpusReference
    const editor = createInputEditor(source)
    const position = editor.state.doc.content.size - 1
    editor.commands.setTextSelection(position)
    editor.commands.insertContent(' tail')

    expect(undo(editor.state, editor.view.dispatch)).toBe(true)
    expect(readSource(editor)).toBe(source)
    expect(editor.state.selection.from).toBe(position)
    expect(redo(editor.state, editor.view.dispatch)).toBe(true)
    expect(readSource(editor)).toBe(source + ' tail')
    expect(editor.state.selection.from).toBe(position + 5)
  }
)
