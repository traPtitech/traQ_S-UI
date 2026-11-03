import type { Node } from '@tiptap/pm/model'

import type { SourceRange } from '../markdown/types'

export type DocumentRange = Readonly<{ from: number; to: number }>

export const toDocumentPosition = (offset: number) => offset + 1
export const toSourceOffset = (position: number) => position - 1

export const toDocumentRange = (range: SourceRange): DocumentRange => ({
  from: toDocumentPosition(range.from),
  to: toDocumentPosition(range.to)
})

export const editorSource = (doc: Node) =>
  doc.textBetween(1, doc.content.size - 1, '', '\uFFFC')
