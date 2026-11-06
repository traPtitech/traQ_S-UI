import type { SourceRange } from '../markdown/types'

declare const documentPosition: unique symbol
export type DocumentPosition = number & { readonly [documentPosition]: true }
export type DocumentRange = Readonly<{
  from: DocumentPosition
  to: DocumentPosition
}>

export const toDocumentPosition = (offset: number): DocumentPosition =>
  (offset + 1) as DocumentPosition
export const toEditorOffset = (position: number) => position - 1

export const toDocumentRange = (range: SourceRange): DocumentRange => ({
  from: toDocumentPosition(range.from),
  to: toDocumentPosition(range.to)
})
