import type { Editor, JSONContent } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'
import type { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'

import {
  type InputMode,
  type InputPart,
  parseInput,
  serializeInput
} from '../references'
import { inputHistory } from './inputHistory'
import { normalizeMessageParts } from './message'

export const partsToContent = (parts: readonly InputPart[]): JSONContent => ({
  type: 'doc',

  content: [
    {
      type: 'paragraph',

      content: parts.flatMap<JSONContent>(part =>
        part.type === 'text'
          ? part.text
            ? [{ type: 'text', text: part.text }]
            : []
          : [
              {
                type: 'reference',

                attrs: {
                  reference: part.reference,
                  source: part.originalSource ?? null
                }
              }
            ]
      )
    }
  ]
})

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
  const parts = parseInput(source, mode)

  editor.commands.setContent(
    partsToContent(mode === 'message' ? normalizeMessageParts(parts) : parts),
    { emitUpdate: false }
  )

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

  const parts = parseInput(source, mode)
  const next = editor.schema.nodeFromJSON(
    partsToContent(mode === 'message' ? normalizeMessageParts(parts) : parts)
  )
  const from = editor.state.doc.content.findDiffStart(next.content)
  const end = editor.state.doc.content.findDiffEnd(next.content)
  if (from === null || !end) return false

  const overlap = from - Math.min(end.a, end.b)
  const to = end.a + Math.max(0, overlap)
  const nextTo = end.b + Math.max(0, overlap)
  const transaction = closeHistory(editor.state.tr).replaceWith(
    from,
    to,
    next.slice(from, nextTo).content
  )

  transaction.setMeta('preventUpdate', true)
  editor.view.dispatch(transaction)
  editor.view.dispatch(closeHistory(editor.state.tr))

  return true
}
