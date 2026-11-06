import type MarkdownIt from 'markdown-it'

import { type MarkdownLineContext, markdownLineContexts } from './lineContexts'
import { trackMarkdownSource } from './source'
import { collectSourceNodes } from './sourceNodes'
import { createMarkdownAnalysisParser } from './syntax'
import type { MarkdownEnvironment, SourceRange } from './types'

export type { SourceRange, MarkdownEnvironment } from './types'
type SourceNodeBase = SourceRange & {
  readonly content: SourceRange
  readonly syntax: readonly SourceRange[]
}

export type MarkdownSourceNode = SourceNodeBase &
  (
    | {
        readonly kind:
          | 'code'
          | 'code-block'
          | 'math'
          | 'math-block'
          | 'table'
          | 'image'
          | 'stamp'
          | 'rule'
          | 'list-marker'
      }
    | { readonly kind: 'style'; readonly tag: string }
    | { readonly kind: 'link'; readonly href: string }
    | {
        readonly kind: 'container'
        readonly container: Readonly<{ quoteDepth: number; indent: number }>
      }
  )

export type MarkdownSourceAnalysis = Readonly<{
  source: string
  lines: readonly MarkdownLineContext[]
  nodes: readonly MarkdownSourceNode[]
  environment: MarkdownEnvironment
}>

export const isLiteralSource = (node: MarkdownSourceNode) =>
  node.kind === 'code' ||
  node.kind === 'code-block' ||
  node.kind === 'math' ||
  node.kind === 'math-block'

let parser: MarkdownIt | undefined

const getParser = () =>
  (parser ??= createMarkdownAnalysisParser().use(trackMarkdownSource))

export const analyzeMarkdownSource = (
  source: string
): MarkdownSourceAnalysis => {
  const environment: MarkdownEnvironment = {}

  if (!/[\r\0]/.test(source)) {
    const tokens = getParser().parse(source, environment)
    const lines = markdownLineContexts(source, tokens)

    return {
      source,
      environment: { references: environment.references },
      lines,
      nodes: collectSourceNodes(source, tokens, lines)
    }
  }

  const positions: number[] = []

  const normalized = source.replace(
    /\r\n?|\0|[^\r\0]/g,
    (text: string, index: number) => {
      positions.push(index)
      return text[0] === '\r' ? '\n' : text === '\0' ? '\uFFFD' : text
    }
  )

  positions.push(source.length)
  const tokens = getParser().parse(normalized, environment)
  const lines = markdownLineContexts(normalized, tokens)
  const nodes = collectSourceNodes(normalized, tokens, lines)

  const map = (range: SourceRange): SourceRange => ({
    from: positions[range.from] ?? NaN,
    to: positions[range.to] ?? NaN
  })

  return {
    source,
    environment: { references: environment.references },
    lines: lines.map(line => ({
      ...line,
      ...map(line),
      contentFrom: positions[line.contentFrom] ?? source.length,
      containers: line.containers.map(container => ({
        ...container,
        ...(container.marker ? { marker: map(container.marker) } : {})
      }))
    })),
    nodes: nodes.map(format => ({
      ...format,
      ...map(format),
      content: map(format.content),
      syntax: format.syntax.map(map)
    }))
  }
}
