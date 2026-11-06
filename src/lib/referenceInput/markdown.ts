import {
  type MarkdownSourceNode,
  analyzeMarkdownSource
} from '../markdown/analysis'
import type { MarkdownSourceAnalysis } from '../markdown/analysis'
import type { MarkdownEnvironment, SourceRange } from '../markdown/types'

type FormatBase = SourceRange & {
  readonly className: string
  readonly style?: 'strong' | 'emphasis' | 'strike' | 'highlight' | 'spoiler'
  readonly syntax: readonly SourceRange[]
  readonly content: SourceRange
}

export type MarkdownFormat = FormatBase &
  (
    | {
        readonly kind: 'inline-style' | 'literal' | 'source-only'
        readonly replacement?: never
        readonly container?: never
      }
    | {
        readonly kind: 'rendered-inline'
        readonly replacement: Readonly<{
          type: 'markdown' | 'stamp'
          text: string
          environment: MarkdownEnvironment
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
  analysis: MarkdownSourceAnalysis
): MarkdownFormat => {
  const { source, environment } = analysis
  const { from, to, content, syntax } = node
  const base = { from, to, content, syntax }

  switch (node.kind) {
    case 'style':
      return {
        ...base,
        kind: 'inline-style',
        style: styles[node.tag],
        className: styles[node.tag] ?? node.tag
      }

    case 'link':
      return { ...base, kind: 'inline-style', className: 'link' }

    case 'code':
    case 'code-block':
      return { ...base, kind: 'literal', className: node.kind }

    case 'math':
    case 'math-block':
    case 'table':
      return { ...base, kind: 'source-only', className: node.kind }

    case 'image':
    case 'stamp':
      return {
        ...base,
        kind: 'rendered-inline',
        className: 'rendered',
        replacement: {
          type: node.kind === 'image' ? 'markdown' : 'stamp',
          text: source.slice(from, to),
          environment
        }
      }

    case 'container':
      return {
        ...base,
        kind: 'container',
        className: node.container.quoteDepth ? 'quote' : 'list-item',
        container: node.container
      }

    case 'list-marker':
      return {
        ...base,
        kind: 'list-marker',
        className: 'bullet'
      }

    case 'rule':
      return { ...base, kind: 'rule', className: 'rule' }
  }
}

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
    formats = analysis.nodes.map(node => toFormat(node, analysis))
    formatsByAnalysis.set(analysis, formats)
  }

  return formats
}
