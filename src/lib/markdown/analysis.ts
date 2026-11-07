import {
  analyzeForEditing,
  describeSource
} from '@traq-flavored-markdown/sdk/editor'

import { markdownParser } from './syntax'

export { isLiteralSource } from '@traq-flavored-markdown/sdk/editor'
export type {
  SourceAnalysis as MarkdownSourceAnalysis,
  SourceNode as MarkdownSourceNode
} from '@traq-flavored-markdown/sdk/editor'

export const analyzeMarkdownSource = (source: string) =>
  describeSource(analyzeForEditing(markdownParser.parseWithSyntax(source)))
