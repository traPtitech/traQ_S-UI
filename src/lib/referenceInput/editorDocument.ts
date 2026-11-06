import type { Editor, JSONContent } from '@tiptap/core'
import type { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'

import { normalizeMessageParts } from '../message/content'
import {
  type InputMode,
  type InputPart,
  parseInput,
  serializeInput
} from '../references'
import { editInput } from './editOperation'
import { inputHistory } from './inputHistory'

export const partsToInlineContent = (
  parts: readonly InputPart[]
): JSONContent[] =>
  parts.flatMap<JSONContent>(part => {
    if (part.type === 'text') {
      return part.text ? [{ type: 'text', text: part.text }] : []
    }

    return [
      {
        type: 'reference',
        attrs: {
          reference: part.reference,
          source: part.originalSource ?? null
        }
      }
    ]
  })

export const partsToContent = (parts: readonly InputPart[]): JSONContent => ({
  type: 'doc',

  content: [
    {
      type: 'paragraph',

      content: partsToInlineContent(parts)
    }
  ]
})

export const sourceToContent = (source: string, mode: InputMode) => {
  const parts = parseInput(source, mode)

  return partsToContent(
    mode === 'message' ? normalizeMessageParts(parts) : parts
  )
}

export const contentToParts = (
  doc: ProseMirrorNode | Fragment
): InputPart[] => {
  const parts: InputPart[] = []

  doc.descendants(node => {
    if (node.isText) parts.push({ type: 'text', text: node.text ?? '' })
    else if (node.type.name === 'reference')
      parts.push({
        type: 'reference',
        reference: node.attrs['reference'],
        originalSource: node.attrs['source'] ?? undefined
      })
  })

  return parts
}

export const readInputDocument = (editor: Editor) =>
  serializeInput(contentToParts(editor.state.doc))

export const loadInputDocument = (
  editor: Editor,
  source: string,
  mode: InputMode,
  force = false
) => {
  if (!force && source === readInputDocument(editor)) return false

  editor.commands.setContent(sourceToContent(source, mode), {
    emitUpdate: false
  })

  if (inputHistory.spec.key) editor.unregisterPlugin(inputHistory.spec.key)
  editor.registerPlugin(inputHistory)
  return true
}

export const replaceInputDocument = (
  editor: Editor,
  source: string,
  mode: InputMode
) => {
  if (source === readInputDocument(editor)) return false

  const next = editor.schema.nodeFromJSON(sourceToContent(source, mode))
  const from = editor.state.doc.content.findDiffStart(next.content)
  const end = editor.state.doc.content.findDiffEnd(next.content)
  if (from === null || !end) return false

  const overlap = from - Math.min(end.a, end.b)
  const to = end.a + Math.max(0, overlap)
  const nextTo = end.b + Math.max(0, overlap)

  editInput(editor, () => {
    const transaction = editor.state.tr.replaceWith(
      from,
      to,
      next.slice(from, nextTo).content
    )

    editor.view.dispatch(transaction.setMeta('preventUpdate', true))
  })

  return true
}
