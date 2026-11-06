import {
  type MarkdownSourceNode,
  analyzeMarkdownSource
} from '../markdown/analysis'
import type { MarkdownSourceAnalysis } from '../markdown/analysis'
import type { MarkdownEnvironment, SourceRange } from '../markdown/types'

type FormatBase = SourceRange & {
  readonly classSuffix: string
  readonly style?: 'strong' | 'emphasis' | 'strike' | 'highlight' | 'spoiler'
  readonly syntax: readonly SourceRange[]
  readonly content: SourceRange
}

export type MarkdownFormat = FormatBase &
  (
    | {
        readonly kind: 'text-style' | 'literal' | 'source-only'
        readonly replacement?: never
        readonly container?: never
      }
    | {
        readonly kind: 'rendered-inline'
        readonly replacement: Readonly<{
          type: 'markdown' | 'stamp'
          text: string
          environment: MarkdownEnvironment
          environmentRevision: number
        }>
        readonly container?: never
      }
    | {
        readonly kind: 'container'
        readonly container: Readonly<{ quoteDepth: number; indent: number }>
        readonly replacement?: never
      }
    | {
        readonly kind: 'list-marker' | 'rule'
        readonly replacement?: never
        readonly container?: never
      }
  )

export const isMarkdownSourceOnly = (format: MarkdownFormat) =>
  format.kind === 'source-only'

const styles: Record<string, FormatBase['style']> = {
  strong: 'strong',
  em: 'emphasis',
  s: 'strike',
  mark: 'highlight',
  span: 'spoiler'
}

const toFormat = (
  node: MarkdownSourceNode,
  analysis: MarkdownSourceAnalysis,
  environmentRevision: number
): MarkdownFormat => {
  const { source, environment } = analysis
  const { from, to, content, syntax } = node
  const base = { from, to, content, syntax }

  switch (node.kind) {
    case 'style':
      return {
        ...base,
        kind: 'text-style',
        style: styles[node.tag],
        classSuffix: styles[node.tag] ?? node.tag
      }

    case 'link':
      return { ...base, kind: 'text-style', classSuffix: 'link' }

    case 'code':
    case 'code-block':
      return { ...base, kind: 'literal', classSuffix: node.kind }

    case 'math':
    case 'math-block':
    case 'table':
      return { ...base, kind: 'source-only', classSuffix: node.kind }

    case 'image':
    case 'stamp':
      return {
        ...base,
        kind: 'rendered-inline',
        classSuffix: 'rendered',
        replacement: {
          type: node.kind === 'image' ? 'markdown' : 'stamp',
          text: source.slice(from, to),
          environment,
          environmentRevision
        }
      }

    case 'container':
      return {
        ...base,
        kind: 'container',
        classSuffix: node.container.quoteDepth ? 'quote' : 'list-item',
        container: node.container
      }

    case 'list-marker':
      return {
        ...base,
        kind: 'list-marker',
        classSuffix: 'bullet'
      }

    case 'rule':
      return { ...base, kind: 'rule', classSuffix: 'rule' }
  }
}

let lastEnvironment = ''
let environmentRevision = 0

const formatsByAnalysis = new WeakMap<
  MarkdownSourceAnalysis,
  readonly MarkdownFormat[]
>()

export const markdownFormats = (
  source: string | MarkdownSourceAnalysis
): readonly MarkdownFormat[] => {
  const analysis =
    typeof source === 'string' ? analyzeMarkdownSource(source) : source
  let formats = formatsByAnalysis.get(analysis)

  if (!formats) {
    const environment = JSON.stringify(analysis.environment)
    if (environment !== lastEnvironment) {
      lastEnvironment = environment
      environmentRevision++
    }

    formats = analysis.nodes.map(node =>
      toFormat(node, analysis, environmentRevision)
    )
    formatsByAnalysis.set(analysis, formats)
  }

  return formats
}
