import type { Node } from '@tiptap/pm/model'

import {
  type ProjectedInputAnalysis,
  analyzeProjectedInput
} from '../references/projection'
import { editorTextBetween } from './editorText'

type DocumentAnalysis = {
  editorText: string
  analysis?: ProjectedInputAnalysis
  probe?: ProjectedInputAnalysis
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

  return (cached.analysis ??= analyzeProjectedInput(cached.editorText))
}

export const analyzeEditorProbe = (doc: Node, source: string) => {
  const cached = documentAnalysis(doc)

  if (source === cached.editorText) return analyzeEditorDocument(doc)
  if (source === cached.probe?.source) return cached.probe

  return (cached.probe = analyzeProjectedInput(source))
}
