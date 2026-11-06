import type { Node } from '@tiptap/pm/model'

import {
  type MarkdownSourceAnalysis,
  analyzeMarkdownSource
} from '../markdown/analysis'
import type { InputPart } from '../references'

export const referencePlaceholder = '\uFFFC'

declare const editorTextAnalysis: unique symbol
export type EditorTextAnalysis = MarkdownSourceAnalysis & {
  readonly [editorTextAnalysis]: true
}

export const analyzeEditorText = (text: string): EditorTextAnalysis =>
  analyzeMarkdownSource(text) as EditorTextAnalysis

export const partsToEditorText = (parts: readonly InputPart[]) =>
  parts
    .map(part => (part.type === 'text' ? part.text : referencePlaceholder))
    .join('')

/** 単一 paragraph 内で、参照 atom を ProseMirror と同じ 1 文字として扱う。 */
export const editorTextBetween = (
  doc: Node,
  from = 1,
  to = doc.content.size - 1
) => doc.textBetween(from, to, '', referencePlaceholder)
