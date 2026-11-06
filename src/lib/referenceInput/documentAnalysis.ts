import type { Node } from '@tiptap/pm/model'

import {
  type MarkdownSourceAnalysis,
  analyzeMarkdownSource
} from '../markdown/analysis'
import { editorSource } from './editorSource'

type DocumentAnalysis = {
  source: string
  analysis?: MarkdownSourceAnalysis
  probe?: MarkdownSourceAnalysis
}

const documents = new WeakMap<Node, DocumentAnalysis>()

const documentAnalysis = (doc: Node) => {
  let cached = documents.get(doc)

  if (!cached) {
    cached = { source: editorSource(doc) }
    documents.set(doc, cached)
  }

  return cached
}

export const analyzeEditorDocument = (doc: Node) => {
  const cached = documentAnalysis(doc)

  return (cached.analysis ??= analyzeMarkdownSource(cached.source))
}

export const analyzeEditorProbe = (doc: Node, source: string) => {
  const cached = documentAnalysis(doc)

  if (source === cached.source) return analyzeEditorDocument(doc)
  if (source === cached.probe?.source) return cached.probe

  return (cached.probe = analyzeMarkdownSource(source))
}
