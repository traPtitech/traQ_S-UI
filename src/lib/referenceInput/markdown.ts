import {
  type MarkdownSourceNode,
  analyzeMarkdownSource
} from '../markdown/analysis'
import type { SourceRange } from '../markdown/types'

type FormatBase = SourceRange & {
  readonly className: string
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
        readonly replacement: string
        readonly container?: never
      }
  )

export const isMarkdownSourceOnly = (format: MarkdownFormat) =>
  format.kind === 'source-only'

const styles: Record<string, string | undefined> = {
  strong: 'strong',
  em: 'emphasis',
  s: 'strike',
  mark: 'highlight',
  span: 'spoiler'
}

const toFormat = (node: MarkdownSourceNode, source: string): MarkdownFormat => {
  const { from, to, content, syntax } = node
  const base = { from, to, content, syntax }

  switch (node.kind) {
    case 'style':
      return {
        ...base,
        kind: 'inline-style',
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
          text: source.slice(from, to)
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
        className: 'bullet',
        replacement: source.slice(content.from, content.to)
      }

    case 'rule':
      return { ...base, kind: 'rule', className: 'rule', replacement: '' }
  }
}

let cached:
  | {
      analysis: ReturnType<typeof analyzeMarkdownSource>
      formats: readonly MarkdownFormat[]
    }
  | undefined

export const markdownFormats = (source: string): readonly MarkdownFormat[] => {
  const analysis = analyzeMarkdownSource(source)

  if (cached?.analysis !== analysis)
    cached = {
      analysis,
      formats: analysis.nodes.map(node => toFormat(node, source))
    }

  return cached.formats
}
