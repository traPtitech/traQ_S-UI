import type { Node } from '@tiptap/pm/model'

import {
  type EditorTextAnalysis,
  analyzeEditorText,
  editorTextBetween
} from './editorText'

type DocumentAnalysis = {
  editorText: string
  analysis?: EditorTextAnalysis
  probe?: EditorTextAnalysis
}

const documents = new WeakMap<Node, DocumentAnalysis>()

const documentAnalysis = (doc: Node) => {
  let cached = documents.get(doc)

  if (!cached) {
    cached = { editorText: editorTextBetween(doc) }
    documents.set(doc, cached)
  }

  return cached
}

export const analyzeEditorDocument = (doc: Node) => {
  const cached = documentAnalysis(doc)

  return (cached.analysis ??= analyzeEditorText(cached.editorText))
}

export const analyzeEditorProbe = (doc: Node, source: string) => {
  const cached = documentAnalysis(doc)

  if (source === cached.editorText) return analyzeEditorDocument(doc)
  if (source === cached.probe?.source) return cached.probe

  return (cached.probe = analyzeEditorText(source))
}
