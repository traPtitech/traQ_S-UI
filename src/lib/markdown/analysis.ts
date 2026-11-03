import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

import { type MarkdownLineContext, markdownLineContexts } from './lineContexts'
import { createMarkdownParser } from './parser'
import { type PositionedToken, trackMarkdownSource } from './source'
import { markdownTableCellPositions } from './tableSource'

export type SourceRange = Readonly<{ from: number; to: number }>
type Range = SourceRange
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
}>

export const isLiteralSource = (node: MarkdownSourceNode) =>
  node.kind === 'code' ||
  node.kind === 'code-block' ||
  node.kind === 'math' ||
  node.kind === 'math-block'

export const protectsMessageReferences = (node: MarkdownSourceNode) =>
  isLiteralSource(node) ||
  node.kind === 'link' ||
  node.kind === 'image' ||
  node.kind === 'stamp'

let parser: ReturnType<typeof createMarkdownParser>['md'] | undefined

const getParser = () => {
  if (!parser) {
    parser = createMarkdownParser().md
    parser.use(trackMarkdownSource)

    // 表示可否の判定前の画像記法を、編集中は一つの原文範囲として扱う。
    const imageParser = new MarkdownIt().inline
    imageParser.ruler.enableOnly('image')
    const [image] = imageParser.ruler.getRules('')

    parser.inline.ruler.before('image', 'source_image', (state, silent) =>
      state.env.sourcePreview ? (image?.(state, silent) ?? false) : false
    )
  }

  return parser
}

const styles = new Set(['strong', 'em', 's', 'a', 'mark', 'span'])

let lastAnalysis: MarkdownSourceAnalysis | undefined

export const analyzeMarkdownSource = (
  source: string
): MarkdownSourceAnalysis => {
  if (lastAnalysis?.source === source) return lastAnalysis

  if (!/[\r\0]/.test(source)) {
    const tokens = getParser().parse(source, { sourcePreview: true })
    const lines = markdownLineContexts(source, tokens)

    lastAnalysis = {
      source,
      lines,
      nodes: collectNodes(source, tokens, lines)
    }

    return lastAnalysis
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
  const tokens = getParser().parse(normalized, { sourcePreview: true })
  const lines = markdownLineContexts(normalized, tokens)
  const nodes = collectNodes(normalized, tokens, lines)

  const map = (range: Range): Range => ({
    from: positions[range.from] ?? NaN,
    to: positions[range.to] ?? NaN
  })

  lastAnalysis = {
    source,
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

  return lastAnalysis
}

const collectNodes = (
  source: string,
  tokens: Token[],
  contexts: readonly MarkdownLineContext[]
): MarkdownSourceNode[] => {
  const lines = source.split('\n')
  const starts: number[] = []
  let offset = 0

  for (const line of lines) {
    starts.push(offset)
    offset += line.length + 1
  }

  const lineStart = (line: number) => starts[line] ?? source.length
  const lineEnd = (line: number) => lineStart(line) + (lines[line]?.length ?? 0)
  const nodes: MarkdownSourceNode[] = []
  const seen = new Set<string>()

  const add = (node: MarkdownSourceNode) => {
    const { from, to, content, syntax } = node
    const key = `${node.kind}:${from}:${to}:${content.from}:${content.to}`

    if (
      ![
        from,
        to,
        content.from,
        content.to,
        ...syntax.flatMap(range => [range.from, range.to])
      ].every(Number.isFinite) ||
      from < 0 ||
      to > source.length ||
      from > content.from ||
      content.from > content.to ||
      content.to > to ||
      syntax.some(
        range => range.from < from || range.from > range.to || range.to > to
      ) ||
      (from === to && node.kind !== 'container') ||
      seen.has(key)
    )
      return

    seen.add(key)
    nodes.push(node)
  }

  let inTable = false
  let cells: number[][] = []
  let column = 0

  for (const token of tokens) {
    if (token.type === 'table_close') {
      inTable = false

      continue
    }

    if (inTable && token.type === 'tr_open' && token.map) {
      const context = contexts[token.map[0]]

      cells = context
        ? markdownTableCellPositions(
            source.slice(context.contentFrom, context.to),
            context.contentFrom
          )
        : []

      column = 0
    }

    // セルの inline トークンには行位置がないため、行と列の順序で対応づける。
    const cell =
      inTable && token.type === 'inline' ? cells[column++] : undefined

    if (!token.map && !cell?.length) continue

    const [first, end] = token.map ?? [0, 0]
    const from = cell?.[0] ?? lineStart(first)
    const to = cell ? (cell.at(-1) ?? from) + 1 : lineEnd(end - 1)

    if (token.type === 'table_open') {
      add({ kind: 'table', from, to, content: { from, to }, syntax: [] })

      inTable = true
    } else if (token.type === 'inline' && token.children) {
      // 引用・リストの接頭辞やインデントを除かれた各行を、原文中の位置へ対応づける。
      const positions: number[] = cell ?? []

      if (!cell)
        positions.push(
          ...((token as PositionedToken).meta?.originalPositions ?? [])
        )

      if (positions.length !== token.content.length) continue
      const at = (position: number) => positions[position] ?? NaN
      const stack: PositionedToken[] = []

      for (const child of token.children as PositionedToken[]) {
        const range = child.meta?.source

        if (!range) continue

        if (
          child.type === 'image' ||
          (child.meta?.match && child.position !== undefined) ||
          child.type === 'math_inline'
        ) {
          const start = at(range.from)
          const finish = at(range.to - 1) + 1

          add({
            kind:
              child.type === 'math_inline'
                ? 'math'
                : child.type === 'image'
                  ? 'image'
                  : 'stamp',
            from: start,
            to: finish,
            content: { from: start, to: finish },
            syntax: [{ from: start, to: finish }]
          })
        } else if (child.type === 'code_inline') {
          const start = at(range.from)
          const finish = at(range.to - 1) + 1
          const size = child.markup.length

          add({
            kind: 'code',
            from: start,
            to: finish,
            content: { from: start + size, to: finish - size },
            syntax: [
              { from: start, to: start + size },
              { from: finish - size, to: finish }
            ]
          })
        } else if (child.nesting === 1 && styles.has(child.tag)) {
          stack.push(child)
        } else if (child.nesting === -1 && styles.has(child.tag)) {
          const opening = stack.pop()
          const openingRange = opening?.meta?.source

          if (!opening || !openingRange || opening.tag !== child.tag) continue

          if (child.tag === 'a') {
            if (opening.info === 'auto') {
              const start = at(openingRange.from)
              const finish = at(openingRange.to - 1) + 1
              const bracketed = opening.markup === 'autolink'

              const body = {
                from: start + (bracketed ? 1 : 0),
                to: finish - (bracketed ? 1 : 0)
              }

              add({
                kind: 'link',
                href: opening.attrGet('href') ?? '',
                from: start,
                to: finish,
                content: body,
                syntax: bracketed
                  ? [
                      { from: start, to: body.from },
                      { from: body.to, to: finish }
                    ]
                  : []
              })

              continue
            }

            const start = at(openingRange.from - 1)

            if (source[start] !== '[') continue

            const finish = at(range.to - 1) + 1
            const body = { from: at(openingRange.from), to: at(range.from) }

            add({
              kind: 'link',
              href: opening.attrGet('href') ?? '',
              from: start,
              to: finish,
              content: body,
              syntax: [
                { from: start, to: body.from },
                { from: body.to, to: finish }
              ]
            })
          } else {
            const size = opening.markup.length

            const start = at(
              openingRange.from + (openingRange.markerWidth ?? size) - size
            )

            const finish = at(range.from + size - 1) + 1

            add({
              kind: 'style',
              tag: child.tag,
              from: start,
              to: finish,
              content: { from: start + size, to: finish - size },
              syntax: [
                { from: start, to: start + size },
                { from: finish - size, to: finish }
              ]
            })
          }
        }
      }
    } else if (token.type === 'heading_open') {
      const prefix = token.markup.startsWith('#')
        ? /#{1,6}(?:[ \t]+|$)/.exec(lines[first] ?? '')
        : null

      if (prefix) {
        const closing = /[ \t]+#+[ \t]*$/.exec(lines[first] ?? '')
        const contentStart = from + prefix.index + prefix[0].length

        const body = {
          from: contentStart,

          to:
            closing && from + closing.index >= contentStart
              ? from + closing.index
              : to
        }

        add({
          kind: 'style',
          tag: token.tag,
          from,
          to,
          content: body,
          syntax: [
            { from: from + prefix.index, to: body.from },
            ...(body.to < to ? [{ from: body.to, to }] : [])
          ]
        })
      } else {
        const body = { from, to: lineEnd(end - 2) }
        add({
          kind: 'style',
          tag: token.tag,
          from,
          to,
          content: body,
          syntax: [{ from: body.to, to }]
        })
      }
    } else if (token.type === 'math_block') {
      add({
        kind: 'math-block',
        from,
        to,
        content: { from, to },
        syntax: [{ from, to }]
      })
    } else if (token.type === 'fence') {
      const closingLine = (token as PositionedToken).meta?.fenceClosingLine
      const body = {
        from: Math.min(lineStart(first + 1), to),
        to: closingLine === undefined ? to : lineStart(closingLine)
      }

      add({
        kind: 'code-block',
        from,
        to,
        content: body,
        syntax: [
          { from, to: body.from },
          ...(closingLine === undefined ? [] : [{ from: body.to, to }])
        ]
      })
    } else if (token.type === 'code_block') {
      add({ kind: 'code-block', from, to, content: { from, to }, syntax: [] })
    } else if (token.type === 'hr') {
      add({
        kind: 'rule',
        from,
        to,
        content: { from, to },
        syntax: [{ from, to }]
      })
    }
  }

  for (const line of contexts) {
    if (!line.containers.length) continue

    const syntax = line.containers
      .filter(part => part.type === 'quote')
      .flatMap(part => (part.marker ? [part.marker] : []))

    add({
      kind: 'container',
      from: line.from,
      to: line.to,
      content: { from: line.contentFrom, to: line.to },
      syntax,
      container: { quoteDepth: line.quoteDepth, indent: line.indent }
    })

    for (const part of line.containers) {
      if (part.type !== 'list' || !part.marker) continue

      add({
        kind: 'list-marker',
        from: line.from,
        to: line.to,
        content: part.marker,
        syntax: [part.marker]
      })
    }
  }

  return nodes
}
